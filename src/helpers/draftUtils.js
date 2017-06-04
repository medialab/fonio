import {
  utils
} from 'scholar-draft';

const {
  insertInlineAssetInEditor,
  insertBlockAssetInEditor,
} = utils;


export const insertInlineContextualization = (editorState, contextualization) => {
  const newEditorState = insertInlineAssetInEditor(editorState, {id: contextualization.id}, editorState.getSelection());
  return newEditorState ? newEditorState : editorState;
};

export const insertBlockContextualization = (editorState, contextualization) => {
  const newEditorState = insertBlockAssetInEditor(editorState, {id: contextualization.id}, editorState.getSelection());
  return newEditorState ? newEditorState : editorState;
};

