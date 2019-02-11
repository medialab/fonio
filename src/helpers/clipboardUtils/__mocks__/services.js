/**
 * This module provides mocked editorStates for handleCopy.spec.js
 * use raw content from story to mock an editorState
 */
import {
  EditorState,
  convertFromRaw
} from 'draft-js';

const getEditorStates = ( story ) => {
  const { sections, sectionsOrder } = story;
  const activeSectionId = sectionsOrder[0];
  const { contents } = sections[activeSectionId];

  /*
   * step 1: initialize editorState with convertFromRaw()
   * step 2: move selection/focus to the end of the editor
   * step 3: get first block and first key
   * step 4: change selection from start to end
   */
  const editorState = EditorState.moveFocusToEnd(
    EditorState.createWithContent( convertFromRaw( contents ) )
  );

  const content = editorState.getCurrentContent();
  const firstBlock = content.getFirstBlock();
  const firstKey = firstBlock.getKey();

  const newSelection = editorState.getSelection().merge( {
    anchorOffset: 0,
    anchorKey: firstKey
  } );
  const newEditorState = EditorState.acceptSelection( editorState, newSelection );

  return {
    [activeSectionId]: newEditorState
  };
};

module.exports = {
  getEditorStates
};
