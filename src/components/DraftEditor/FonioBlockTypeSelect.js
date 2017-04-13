
// import React from 'react';
// import {List} from 'immutable';

// import {
//   ContentState,
//   EditorState,
//   ContentBlock,
//   genKey
// } from 'draft-js';

// import {
//   HeadlineOneButton,
//   HeadlineTwoButton,
//   BlockquoteButton,
//   CodeBlockButton,
//   UnorderedListButton,
//   OrderedListButton,
//   createBlockStyleButton
// } from 'draft-js-buttons'; // eslint-disable-line import/no-unresolved

// import BlockTypeSelect from './BlockTypeSelect';

// const addTestBlock = (editorState) => {
//   const newBlock = new ContentBlock({
//     key: genKey(),
//     type: 'unstyled',
//     text: 'Coucou comment ça va',
//     characterList: List()
//   });

//   const contentState = editorState.getCurrentContent();
//   const newBlockMap = contentState.getBlockMap().set(newBlock.key, newBlock);

//   return EditorState.push(
//     editorState,
//     ContentState
//       .createFromBlockArray(newBlockMap.toArray())
//       .set('selectionBefore', contentState.getSelectionBefore())
//       .set('selectionAfter', contentState.getSelectionAfter())
//   );
// };

// const AssetBtn = ({
//   theme,
//   setEditorState,
//   getEditorState
// }) => {
//   const preventBubblingUp = (e) => {
//     e.preventDefault();
//   };
//   const promptAsset = () => {
//     const newState = getEditorState();
//     newState.assetPrompted = true;
//     setEditorState(newState);
//   };
//   return (
//     <div className="draftJsToolbar__buttonWrapper__1Dmqh" onMouseDown={preventBubblingUp}>
//       <button title="append asset" onClick={promptAsset} className="draftJsToolbar__button__qi1gf">
//         +a
//       </button>
//     </div>
//   );
// };

// const FonioBlockTypeSelect = ({getEditorState, setEditorState, theme}) => {
//   return (
//     <BlockTypeSelect
//       getEditorState={getEditorState}
//       setEditorState={setEditorState}
//       theme={theme}
//       structure={[
//         AssetBtn,
//         // BlockquoteButton,
//         // CodeBlockButton,
//         // HeadlineOneButton,
//         // HeadlineTwoButton,
//         // OrderedListButton,
//         // UnorderedListButton,
//       ]} />
//   );
// };

// export default FonioBlockTypeSelect;
