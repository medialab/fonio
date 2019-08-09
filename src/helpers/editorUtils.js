/**
 * This module provides misc utils for the editor
 * @module fonio/components/SectionEditor
 */
import {
  EditorState,
  Modifier,
  convertToRaw,
} from 'draft-js';

import {
  constants
} from 'scholar-draft';

const {
  INLINE_ASSET,
} = constants;

/**
 * Add plain text in one of the editor states (main or note)
 * @param {string} text - text to add
 * @param {string} contentId - 'main' or noteId
 */
export const addTextAtCurrentSelection = ( text, contentId, props ) => {
    const {
      activeSection,
      activeStoryId,
      sectionId,
      editorStates,
      updateDraftEditorState,
      updateSection,
    } = props;
    const editorState = contentId === 'main' ? editorStates[sectionId] : editorStates[contentId];
    const editorStateId = contentId === 'main' ? sectionId : contentId;
    const newContentState = Modifier.insertText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      text,
    );
    let newSection;
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'insert-text'
    );
    updateDraftEditorState( editorStateId, newEditorState );
    if ( contentId === 'main' ) {
      newSection = {
        ...activeSection,
        contents: convertToRaw( newEditorState.getCurrentContent() )
      };
    }
    else {
      newSection = {
        ...activeSection,
        notes: {
          ...activeSection.notes,
          [contentId]: {
            ...activeSection.notes[contentId],
            contents: convertToRaw( newEditorState.getCurrentContent() )
          }
        }
      };
    }
    updateSection( activeStoryId, sectionId, newSection );
  };

/**
 * Format story data as assets
 * @return {object} assets
 */
export const computeAssets = ( props ) => {
  const {
      story: {
        contextualizers,
        contextualizations,
        resources
    }
  } = props;
  const assets = Object.keys( contextualizations )
  .reduce( ( ass, id ) => {
    const contextualization = contextualizations[id];
    const contextualizer = contextualizers[contextualization.contextualizerId];
    const resource = resources[contextualization.resourceId];
    if ( contextualizer && resource ) {
      return {
        ...ass,
        [id]: {
          ...contextualization,
          resource,
          contextualizer,
          type: contextualizer ? contextualizer.type : INLINE_ASSET
        }
      };
    }
    return { ...ass };
  }, {} );

  return assets;
};

/**
 * Computes assets choices menu data and callback
 */
export const computeAssetChoiceProps = ( props ) => {
  const {
    story: {
      resources
    },
    setEditorFocus,
    cancelAssetRequest,
    startNewResourceConfiguration
  } = props;
  return {
    options: Object.keys( resources ).map( ( key ) => resources[key] ),
    addNewResource: () => startNewResourceConfiguration( true ),
    addPlainText: ( text, contentId ) => {
      addTextAtCurrentSelection( text, contentId, props );
      cancelAssetRequest();
      setEditorFocus( undefined );
      setTimeout( () => {
        setEditorFocus( contentId );
      } );
    }
  };
};

