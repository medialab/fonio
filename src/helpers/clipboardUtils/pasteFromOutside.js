/**
 * This module provides the logic for handling pasting contents in editor
 * when pasting contents comes from outside fonio (webpage, text editor, ... machine clipboard)
 * @module fonio/components/SectionEditor
 */
import {
  EditorState,
  convertToRaw,
  Modifier,
  SelectionState,
} from 'draft-js';

import { convertFromHTML } from 'draft-convert';
import get from 'axios';

import parsePastedLink from './parsePastedLink';
import parsePastedImage from './parsePastedImage';

const HTML_LENGTH_LOADING_SCREEN_THRESHOLD = 1000;
const MEDIUM_TIMEOUT = 500;

/**
 * Parses and structure pasted data into a copied content states + diverse objects
 * that will be created by the parsing operation
 */
export const computePastedData = ( {
  resources,
  activeSection,
  html
} ) => {
  const resourcesList = Object.keys( resources ).map( ( resourceId ) => resources[resourceId] );
  const resourcesToAdd = [];
  const contextualizationsToAdd = [];
  const contextualizersToAdd = [];
  const activeSectionId = activeSection.id;
  const imagesToAdd = [];

  const copiedContentState = convertFromHTML( {
    htmlToEntity: ( nodeName, node, createEntity ) => {
      if ( nodeName === 'a' ) {
        const {
          contextualization,
          contextualizer,
          resource,
          entity
        } = parsePastedLink(
              node,
              [ ...resourcesList, ...resourcesToAdd ],
              activeSectionId
        );

        if ( contextualization ) {
          contextualizationsToAdd.push( contextualization );
        }
        if ( contextualizer ) {
          contextualizersToAdd.push( contextualizer );
        }
        if ( resource ) {
          resourcesToAdd.push( resource );
        }
        if ( entity ) {
          return createEntity( entity.type, entity.mutability, entity.data );
        }
      }
      else if ( nodeName === 'img' ) {
        const {
          contextualization,
          contextualizer,
          resource,
          entity
        } = parsePastedImage(
              node,
              [ ...resourcesList, ...resourcesToAdd ],
              activeSectionId
        );

        if ( contextualization ) {
          contextualizationsToAdd.push( contextualization );
        }
        if ( contextualizer ) {
          contextualizersToAdd.push( contextualizer );
        }
        if ( resource ) {
          imagesToAdd.push( resource );
        }
        if ( entity ) {
          return createEntity( entity.type, entity.mutability, entity.data );
        }
      }
    },
    htmlToBlock: ( nodeName ) => {
      if ( nodeName === 'img' ) {
        return {
          type: 'atomic',
          data: {}
        };
      }
    }
  } )( html );

  return {
    copiedContentState,
    resourcesToAdd,
    contextualizationsToAdd,
    contextualizersToAdd,
    imagesToAdd
  };
};

/**
 * Applies related operations for pasting external content
 */
export const handlePasting = ( {
  html = '',
  activeEditorState,
  updateSection,
  createResource,
  uploadResource,
  createContextualization,
  createContextualizer,
  updateDraftEditorState,

  setEditorPastingStatus,

  userId,
  activeEditorStateId,
  activeSection,
  storyId,
  resources,
  editorFocus,

  setEditorFocus,
} ) => {

  /*
   * unset editor focus to avoid
   * noisy draft-js editor updates
   */
  setEditorFocus( undefined );

  const editorId = editorFocus === 'main' ? activeSection.id : editorFocus;

  const {
    copiedContentState,
    resourcesToAdd,
    contextualizationsToAdd: tContextualizationsToAdd,
    contextualizersToAdd: tContextualizersToAdd,
    imagesToAdd
  } = computePastedData( {
    resources,
    activeSection,
    html
  } );

  let contextualizationsToAdd = tContextualizationsToAdd;
  let contextualizersToAdd = tContextualizersToAdd;

  /**
   * Append copied content state to existing editor state
   */
  let newContentState = Modifier.replaceWithFragment(
    activeEditorState.getCurrentContent(),
    activeEditorState.getSelection(),
    copiedContentState.getBlockMap()
  );

    /**
     * Chaining all objects creations requiring server confirmation at each step
     * (we will actually update editor state only after this
     * to avoid discrepancies due to interruptions/errors).
     */
    Promise.resolve()

      /**
       * fetching and creating images.
       * we try to retrieve them from their source.
       * if we fail (mostly due to CORS policies) then image is not added
       */
      .then( () => {
        if ( imagesToAdd.length ) {
          setEditorPastingStatus( {
            status: 'fetching-images',
            statusParameters: {
              length: imagesToAdd.length
            }
          } );
        }
        return imagesToAdd.reduce( ( cur, next, index ) => {
          return cur.then( () => {
            return new Promise( ( resolve, reject ) => {
               setEditorPastingStatus( {
                status: 'creating-images',
                statusParameters: {
                  length: imagesToAdd.length,
                  iteration: index + 1
                }
              } );
              get( next.data.url, { responseType: 'arraybuffer' } )
                .then( ( response ) => {
                  let base64 = btoa(
                    new Uint8Array( response.data )
                      .reduce( ( data, byte ) => data + String.fromCharCode( byte ), '' )
                  );
                  base64 = `data:${response.headers['content-type'].toLowerCase()};base64,${base64}`;
                  const resource = {
                      ...next,
                      data: { base64 }
                    };
                  uploadResource( {
                    storyId,
                    userId,
                    resourceId: next.id,
                    resource
                  }, 'create', ( err ) => {
                    if ( err ) {
                      reject( err );
                    }
                    else {
                      resolve();
                    }
                  } );
                } )
                // get was not successful
                /**
                 * @todo
                 * a lot of these requests will fail because of CORS policies of most website.
                 * a workaround would be to use server as a proxy to get the image.
                 * we did not choose this option for now because it would require a lot of care
                 * regarding security rules and may be overkill for the benefits of this feature
                 */
                .catch( ( err ) => {
                  console.error( 'image fetching failed', err );/* eslint no-console: 0 */
                  // cancel contextualizations creation and entities attached to this resource
                  const resourceId = next.id;
                  contextualizationsToAdd = contextualizationsToAdd.filter( ( contextualization ) => {
                    if ( contextualization.resourceId === resourceId ) {
                      // remove contextualizer to create
                      contextualizersToAdd = contextualizersToAdd.filter( ( contextualizer ) => contextualizer.id !== contextualization.contextualizerId );
                      // remove entity from new content state to avoid discrepancies
                      newContentState.getBlocksAsArray()
                      .forEach( ( contentBlock ) => {
                        contentBlock.getCharacterList()
                          .forEach( ( character, charIndex ) => {
                            let entity = character.getEntity();
                            if ( entity ) {
                              entity = newContentState.getEntity( entity );
                              entity = entity.toJS();
                              if ( entity.type === 'BLOCK_ASSET' && entity.data && entity.data.asset && entity.data.asset.id === contextualization.id ) {
                                let selection = SelectionState.createEmpty( contentBlock.getKey() );
                                selection = selection.merge( {
                                  anchorOffset: charIndex,
                                  focusOffset: charIndex + 1,
                                } );
                                newContentState = Modifier.applyEntity( newContentState, selection, null );
                              }
                            }
                          } );
                      } );
                      return false;
                    }
                    return true;
                  } );
                  resolve();
                } );
            } );
          } );
        }, Promise.resolve() );

      } )

      /**
       * creating other resources
       */
      .then( () => {
        if ( resourcesToAdd.length ) {
          setEditorPastingStatus( {
            status: 'creating-resources',
            statusParameters: {
              length: resourcesToAdd.length
            }
          } );
        }
        return resourcesToAdd.reduce( ( cur, next, index ) => {
          return cur.then( () => {
            return new Promise( ( resolve, reject ) => {
               setEditorPastingStatus( {
                status: 'creating-resources',
                statusParameters: {
                  length: resourcesToAdd.length,
                  iteration: index + 1
                }
              } );
              createResource( {
                storyId,
                userId,
                resourceId: next.id,
                resource: next
              }, ( err ) => {
                if ( err ) {
                  reject( err );
                }
                else {
                  resolve();
                }
              } );
            } );
          } );
        }, Promise.resolve() );

      } )

      /**
       * Creating contextualizers & contextualizations
       */
      .then( () => {
        if ( contextualizersToAdd.length ) {
          setEditorPastingStatus( {
            status: 'attaching-contextualizers',
            statusParameters: {
              length: contextualizersToAdd.length
            }
          } );
        }

        return contextualizersToAdd.reduce( ( cur, next, index ) => {
          return cur.then( () => {
            return new Promise( ( resolve, reject ) => {
               setEditorPastingStatus( {
                status: 'attaching-contextualizers',
                statusParameters: {
                  length: contextualizersToAdd.length,
                  iteration: index + 1
                }
              } );
              const contextualizationToCreate = contextualizationsToAdd[index];

              createContextualizer( {
                storyId,
                userId,
                contextualizerId: next.id,
                contextualizer: next
              }, ( err ) => {
                if ( err ) {
                  reject( err );
                }
                // then creating the contextualization
                else {
                  createContextualization( {
                    storyId,
                    userId,
                    contextualizationId: contextualizationToCreate.id,
                    contextualization: contextualizationToCreate
                  }, ( err2 ) => {
                    if ( err2 ) {
                      reject( err2 );
                    }
                    else {
                      resolve();
                    }
                  } );
                }
              } );
            } );
          } );
        }, Promise.resolve() );

      } )

      /**
       * Updating related section draft contents
       */
      .then( () => {
        setEditorPastingStatus( {
          status: 'updating-contents'
        } );

        const newEditorState = EditorState.push(
          activeEditorState,
          newContentState,
          'paste-content'
        );

        let newSection;
        const contents = convertToRaw( newEditorState.getCurrentContent() );
        if ( editorFocus === 'main' ) {
          newSection = {
            ...activeSection,
            contents,
          };
        }
        else {
          newSection = {
            ...activeSection,
            notes: {
              ...activeSection.notes,
              [activeEditorStateId]: {
                ...activeSection.notes[activeEditorStateId],
                contents,
              }
            }
          };
        }

        /**
         * Simultaneously update section raw content,
         * draft-js content states,
         * and set editor view to edition setting
         */
        setTimeout( () => {
          updateSection( newSection );
          updateDraftEditorState( editorId, newEditorState );
          setEditorFocus( editorFocus );
          setEditorPastingStatus( undefined );
        } );

      } );
  };

const pasteFromOutside = ( {
  html = '',
  activeEditorState,
  updateSection,
  createResource,
  uploadResource,
  createContextualization,
  createContextualizer,
  updateDraftEditorState,

  setEditorPastingStatus,

  userId,
  activeEditorStateId,
  activeSection,
  storyId,
  resources,
  editorFocus,

  setEditorFocus,
} ) => {

  /**
   * We show a loading modal only if html content is big enough
   */
  if ( html.length > HTML_LENGTH_LOADING_SCREEN_THRESHOLD ) {
    setEditorPastingStatus( {
      status: 'converting-contents'
    } );
    setTimeout( () =>
      handlePasting( {
        html,
        activeEditorState,
        updateSection,
        createResource,
        uploadResource,
        createContextualization,
        createContextualizer,
        updateDraftEditorState,

        setEditorPastingStatus,

        userId,
        activeEditorStateId,
        activeSection,
        storyId,
        resources,
        editorFocus,

        setEditorFocus,
      } )
      , MEDIUM_TIMEOUT );
  }
  else handlePasting( {
    html,
    activeEditorState,
    updateSection,
    createResource,
    uploadResource,
    createContextualization,
    createContextualizer,
    updateDraftEditorState,

    setEditorPastingStatus,

    userId,
    activeEditorStateId,
    activeSection,
    storyId,
    resources,
    editorFocus,

    setEditorFocus,
  } );

  return true;
};

export default pasteFromOutside;
