/**
 * This module provides mocked editorStates for handleCopy.spec.js
 * use raw content from story to mock an editorState
 */
import {
  EditorState,
  convertFromRaw
} from 'draft-js';

const getEditorStates = ( { story, isBackward } ) => {
  const { sections, sectionsOrder } = story;
  const activeSectionId = sectionsOrder[0];
  const { contents } = sections[activeSectionId];

  /*
   * step 1: initialize editorState with convertFromRaw()
   * step 2: move selection/focus to the end of the editor
   * step 3: get first/last block's key
   * step 4: change selection from start/end to end/start
   */
  const editorState = EditorState.moveFocusToEnd(
    EditorState.createWithContent( convertFromRaw( contents ) )
  );
  const selection = editorState.getSelection();
  const firstBlock = editorState.getCurrentContent().getFirstBlock();
  const firstKey = firstBlock.getKey();
  const lastBlock = editorState.getCurrentContent().getLastBlock();
  const lastKey = lastBlock.getKey();
  const endOffset = selection.getFocusOffset();

  const newSelection = selection.merge( {
    anchorOffset: isBackward ? endOffset : 0,
    anchorKey: isBackward ? firstKey : lastKey,
    focusOffset: isBackward ? 0 : endOffset,
    focusKey: isBackward ? lastKey : firstKey,
    isBackward
  } );

  const newEditorState = EditorState.acceptSelection( editorState, newSelection );

  return {
    [activeSectionId]: newEditorState
  };
};

module.exports = {
  getEditorStates
};
