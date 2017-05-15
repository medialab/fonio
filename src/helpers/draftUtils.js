import {
  EditorState,
  AtomicBlockUtils
} from 'draft-js';

export const insertAssetInEditor = (shadowEditor, metadata, atSelection) => {
  const contentState = shadowEditor.getCurrentContent();
  // creating the entity
  const newContentState = contentState.createEntity(
    metadata.type.toUpperCase(),
    'MUTABLE',
    {
      id: metadata.id
    }
  );
  shadowEditor = EditorState.createWithContent(newContentState);
  const newEntityKey = newContentState.getLastCreatedEntityKey();
  // inserting the entity as an atomic block
  const EditorWithBlock = AtomicBlockUtils.insertAtomicBlock(
    EditorState.forceSelection(shadowEditor, atSelection),
    newEntityKey,
    ' '
  );
  return EditorWithBlock;
};
