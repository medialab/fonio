import {
  EditorState,
  // ContentState,
  convertToRaw,
  // SelectionState,
  Modifier,
} from 'draft-js';

import {convertFromHTML} from 'draft-convert';

// import {v4 as generateId} from 'uuid';

// import {createDefaultResource} from '../../../helpers/schemaUtils';


// import {
//   // constants,
//   utils,
// } from 'scholar-draft';


// const {
//   insertFragment,
// } = utils;

import parsePastedLink from './parsePastedLink';

// const {
//   // SCHOLAR_DRAFT_CLIPBOARD_CODE,
//   // INLINE_ASSET,
// } = constants;

const pasteFromOutside = ({
  html = '',
  activeEditorState,
  updateSection,
  createResource,
  createContextualization,
  createContextualizer,
  updateDraftEditorState,

  // editorPastingStatus,
  setEditorPastingStatus,

  userId,
  activeEditorStateId,
  activeSection,
  storyId,
  resources,
  editorFocus,
  // onEditorChange,

  setEditorFocus,
}) => {

  const editorId = editorFocus === 'main' ? activeSection.id : editorFocus;
  // console.time('copie');

  const handle = () => {
    // console.time('copy');

    const resourcesList = Object.keys(resources).map(resourceId => resources[resourceId]);
    const resourcesToAdd = [];
    const contextualizationsToAdd = [];
    const contextualizersToAdd = [];
    const activeSectionId = activeSection.id;

    setEditorFocus(undefined);
    // console.time('blocks from html');

    const copiedContentState = convertFromHTML({
      htmlToEntity: (nodeName, node, createEntity) => {
        if (nodeName === 'a') {
          const {
            contextualization,
            contextualizer,
            resource,
            entity
          } = parsePastedLink(
                node,
                [...resourcesList, ...resourcesToAdd],
                activeSectionId
          );

          if (contextualization) {
            contextualizationsToAdd.push(contextualization);
          }
          if (contextualizer) {
            contextualizersToAdd.push(contextualizer);
          }
          if (resource) {
            resourcesToAdd.push(resource);
          }
          if (entity) {
            return createEntity(entity.type, entity.mutability, entity.data);
          }
        }
      },
      htmlToBlock: (nodeName) => {
        if (nodeName === 'image') {
          return null;
        }
      }
    })(html);

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
    // console.log('before', convertToRaw(newEditorState.getCurrentContent()))

    Promise.resolve()
      .then(() => {
        if (resourcesToAdd.length) {
          setEditorPastingStatus({
            status: 'creating-resources',
            statusParameters: {
              length: resourcesToAdd.length
            }
          });
        }
        return resourcesToAdd.reduce((cur, next) =>
          new Promise((resolve, reject) => {
            createResource({
              storyId,
              userId,
              resourceId: next.id,
              resource: next
            }, err => {
              if (err) {
                reject(err);
              }
              else resolve();
            });
          })
        , Promise.resolve());
      })
      .then(() => {
        if (contextualizersToAdd.length) {
          setEditorPastingStatus({
            status: 'attaching-contextualizers',
            statusParameters: {
              length: contextualizersToAdd.length
            }
          });
        }

        return contextualizersToAdd.reduce((cur, next) =>
          new Promise((resolve, reject) => {
            createContextualizer({
              storyId,
              userId,
              contextualizerId: next.id,
              contextualizer: next
            }, err => {
              if (err) {
                reject(err);
              }
 else resolve();
            });

          })
        , Promise.resolve());
      })
      .then(() =>
        contextualizationsToAdd.reduce((cur, next) =>
          new Promise((resolve, reject) => {
            createContextualization({
              storyId,
              userId,
              contextualizationId: next.id,
              contextualization: next
            }, err => {
              if (err) {
                reject(err);
              }
 else resolve();
            });
          })
        , Promise.resolve())
      )
      .then(() => {
        setEditorPastingStatus({
          status: 'updating-contents'
        });

        let newSection;
        const contents = convertToRaw(newEditorState.getCurrentContent());
        if (editorFocus === 'main') {
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
        // console.log('run on editor change', convertToRaw(newEditorState.getCurrentContent()));
        // onEditorChange(editorId, newEditorState);
        setTimeout(() => {
          updateSection(newSection);
          updateDraftEditorState(editorId, newEditorState);
          setEditorFocus(editorFocus);
          setEditorPastingStatus(undefined);
        });

        // console.timeEnd('copy');
      });
  };

  if (html.length > 1000) {
    setEditorPastingStatus({
      status: 'converting-contents'
    });
    setTimeout(handle, 500);
  }
 else handle();

  return true;
};

export default pasteFromOutside;
