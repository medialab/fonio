/**
 * This module provides the logic for handling pasting contents in editor
 * when pasting contents comes from outside fonio (webpage, text editor, ... machine clipboard)
 * @module fonio/components/SectionEditor
 */
import {
  EditorState,
  convertToRaw,
  Modifier,
} from 'draft-js';

import { convertFromHTML } from 'draft-convert';

import parsePastedLink from './parsePastedLink';


const HTML_LENGTH_LOADING_SCREEN_THRESHOLD = 1000;
const MEDIUM_TIMEOUT = 500;

const pasteFromOutside = ( {
  html = '',
  activeEditorState,
  updateSection,
  createResource,
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
    const contextualizationsToAdd = [];
    const contextualizersToAdd = [];
    const activeSectionId = activeSection.id;

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
      },
      htmlToBlock: ( nodeName ) => {
        if ( nodeName === 'image' ) {
          return null;
        }
      }
    } )( html );

    /**
     * Append copied content state to existing editor state
     */
    const newContentState = Modifier.replaceWithFragment(
      activeEditorState.getCurrentContent(),
      activeEditorState.getSelection(),
      copiedContentState.getBlockMap()
    );
    const newEditorState = EditorState.push(
      activeEditorState,
      newContentState,
      'paste-content'
    );

    /**
     * Chaining all objects creations requiring server confirmation
     * (we will actually update editor state only after this
     * to avoid discrepancies due to interruptions/errors)
     */
    Promise.resolve()
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
