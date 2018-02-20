/**
 * This module handles scholar-draft related operations on draft-js states
 * @module fonio/utils/draftUtils
 */

import {
  utils
} from 'scholar-draft';

const {
  insertInlineAssetInEditor,
  insertBlockAssetInEditor,
} = utils;

/**
 * Inserts an inline contextualization entity into the given draft editor state
 * @param {EditorState} editorState - the editor state before insertion
 * @param {object} contextualization - the contextualization to link the entity to
 * @return {EditorState} newEditorState - a new editor state
 */
export const insertInlineContextualization = (editorState, contextualization) => {
  const newEditorState = insertInlineAssetInEditor(editorState, {id: contextualization.id}, editorState.getSelection());
  return newEditorState ? newEditorState : editorState;
};

/**
 * Inserts a block contextualization entity into the given draft editor state
 * @param {EditorState} editorState - the editor state before insertion
 * @param {object} contextualization - the contextualization to link the entity to
 * @return {EditorState} newEditorState - a new editor state
 */
export const insertBlockContextualization = (editorState, contextualization) => {
  const newEditorState = insertBlockAssetInEditor(editorState, {id: contextualization.id}, editorState.getSelection());
  return newEditorState ? newEditorState : editorState;
};


/**
 * Get current selected text
 * @param  {Draft.ContentState}
 * @param  {Draft.SelectionState}
 * @param  {String}
 * @return {String}
 */
export const getTextSelection = (contentState, selection, blockDelimiter) => {
    blockDelimiter = blockDelimiter || '\n';
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();
    const blocks = contentState.getBlockMap();

    let lastWasEnd = false;
    const selectedBlock = blocks
        .skipUntil(function(block) {
            return block.getKey() === startKey;
        })
        .takeUntil(function(block) {
            const result = lastWasEnd;

            if (block.getKey() === endKey) {
                lastWasEnd = true;
            }

            return result;
        });

    return selectedBlock
        .map(function(block) {
            const key = block.getKey();
            let text = block.getText();

            let start = 0;
            let end = text.length;

            if (key === startKey) {
                start = selection.getStartOffset();
            }
            if (key === endKey) {
                end = selection.getEndOffset();
            }

            text = text.slice(start, end);
            return text;
        })
        .join(blockDelimiter);
};
