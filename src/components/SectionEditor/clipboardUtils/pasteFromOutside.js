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

  const editorId = editorFocus === 'main' ? activeSection.id : editorFocus;

  const handle = () => {
    const resourcesList = Object.keys( resources ).map( ( resourceId ) => resources[resourceId] );
    const resourcesToAdd = [];
    let contextualizationsToAdd = [];
    let contextualizersToAdd = [];
    const activeSectionId = activeSection.id;
    const imagesToAdd = [];

    /*
     * unset editor focus to avoid
     * noisy draft-js editor updates
     */
    setEditorFocus( undefined );

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

    /**
     * Append copied content state to existing editor state
     */
    let newContentState = Modifier.replaceWithFragment(
      activeEditorState.getCurrentContent(),
      activeEditorState.getSelection(),
      copiedContentState.getBlockMap()
    );

    /**
     * Chaining all objects creations requiring server confirmation
     * (we will actually update editor state only after this
     * to avoid discrepancies due to interruptions/errors)
     */
    Promise.resolve()
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
                 * a lot of these requests will fail because of CORS policies of most website
                 * a workaround would be to use server as a proxy to get the image
                 * we did not choose this option for now because it would require a lot of care
                 * regarding security rules and is overkill for the benefits of this feature
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

  /**
   * We show a loading modal only if html content is big enough
   */
  if ( html.length > HTML_LENGTH_LOADING_SCREEN_THRESHOLD ) {
    setEditorPastingStatus( {
      status: 'converting-contents'
    } );
    setTimeout( handle, MEDIUM_TIMEOUT );
  }
 else handle();

  return true;
};

export default pasteFromOutside;
