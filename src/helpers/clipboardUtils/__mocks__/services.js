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
  if ( sections === undefined || Object.keys( sections ).length === 0 ) {
    return;
  }
  const activeSectionId = sectionsOrder[0];
  const { contents, notes, notesOrder } = sections[activeSectionId];

  /*
   * initalize editorState for main editor
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
    anchorKey: isBackward ? lastKey : firstKey,
    focusOffset: isBackward ? 0 : endOffset,
    focusKey: isBackward ? firstKey : lastKey,
    isBackward
  } );

  const newEditorState = EditorState.acceptSelection( editorState, newSelection );

  /*
   * initalize editorState for note editor
   */

  if ( notesOrder.length > 0 ) {
    const noteId = notesOrder[0];
    const noteContents = notes[noteId].contents;
    const noteEditorState = EditorState.createWithContent( convertFromRaw( noteContents ) );

    return {
      [activeSectionId]: newEditorState,
      [noteId]: noteEditorState
    };
  }
  else {
    return {
      [activeSectionId]: newEditorState
    };
  }
};

module.exports = {
  getEditorStates
};
