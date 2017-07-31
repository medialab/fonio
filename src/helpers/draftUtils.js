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

