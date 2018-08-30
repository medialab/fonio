import {
  EditorState,
  convertToRaw,
  SelectionState,
  Modifier,
} from 'draft-js';

import {v4 as generateId} from 'uuid';

import {createDefaultResource} from '../../../helpers/schemaUtils';


import {
  constants
} from 'scholar-draft';

const {
  // SCHOLAR_DRAFT_CLIPBOARD_CODE,
  INLINE_ASSET,
} = constants;

const pasteFromOutside = ({
  activeEditorState,
  updateSection,
  createResource,
  createContextualization,
  createContextualizer,
  updateDraftEditorState,

  userId,
  activeEditorStateId,
  activeSection,
  storyId,
  resources,
  editorFocus,
}) => {
  const activeSectionId = activeSection.id;
  // replacing pasted links with resources/contextualizers/contextualizations
    let contentState = activeEditorState.getCurrentContent();
    // console.log(convertToRaw(contentState))
    const mods = [];
    // trying not to duplicate same links
    const linksMap = {};
    // const imagesMap = {};
    contentState
      .getBlocksAsArray()
      .map(contentBlock => {
        let url;
        // let src;
        // let alt;
        let entityKey;
        let type;
        contentBlock.findEntityRanges(
          (character) => {
            entityKey = character.getEntity();
            if (entityKey === null) {
              return false;
            }
            type = contentState.getEntity(entityKey).getType();
            if (
              type === 'LINK'
            ) {
              url = contentState.getEntity(entityKey).getData().url;
              return true;
            }
            else if (
              type === 'IMAGE'
              ) {
               // src = contentState.getEntity(entityKey).getData().src;
               // alt = contentState.getEntity(entityKey).getData().alt;
               return true;
            }
          },
          (from, to) => {
            const text = contentBlock.getText().substring(from, to);
            const blockKey = contentBlock.getKey();
            let resId = generateId();
            let shouldCreateResource;
            let matchingResourceId;
            // case LINK entity
            if (type === 'LINK') {
              matchingResourceId = Object.keys(resources)
                .find(resourceId => resources[resourceId].metadata.type === 'webpage' && resources[resourceId].data.url === url);

              /**
               * avoiding to create duplicate resources
               */
              if (linksMap[url]) {
                resId = linksMap[url];
                shouldCreateResource = false;
              }
              else if (matchingResourceId) {
                resId = matchingResourceId;
                shouldCreateResource = false;
              }
              else {
                linksMap[url] = resId;
                shouldCreateResource = true;
              }
            }
            // case IMAGE entity
            else if (type === 'IMAGE') {
              const selectionState = activeEditorState.getSelection().merge({
                anchorKey: blockKey,
                focusKey: blockKey,
                anchorOffset: from,
                focusOffset: to,
              });

              // we remove the IMAGE entity
              try {
                // it sometimes fails
                // why ? draft-js mystery ...
                // @todo investigate why it fails in some cases
                contentState = Modifier.applyEntity(
                  contentState,
                  selectionState,
                  null
                );
              }
              catch (e) {
                console.warn('An error occured while trying to remove an image from pasted contents:');/* eslint no-console: 0 */
                console.error(e);/* eslint no-console: 0 */
              }

              // we remove the corresponding text
              contentState = Modifier.removeRange(
                contentState,
                selectionState
              );
              return;
              // shouldCreateResource = true;
              // imagesMap[src] = {src, alt};
            }

            const contextualizationId = generateId();
            const contextualizerId = generateId();
            let resource;
            let contextualizer;
            let contextualization;
            // case IMAGE entity
            /*if (src) {
              resource = {
                id: resId,
                metadata: {
                  type: 'image',
                  createdAt: new Date().getTime(),
                  lastModifiedAt: new Date().getTime(),
                  title: alt,
                  ext: src.split('.').pop() || 'jpeg'
                },
                data: {
                  url: src,
                }
              };
              contextualizer = {
                id: contextualizerId,
                type: 'image',
                insertionType: 'block'
              };
              contextualization = {
                id: contextualizationId,
                resourceId: resId,
                contextualizerId,
                type: 'image',
                title: alt
              };
            }
            // case LINK entity
            else */ if (url) {
              resource = {
                ...createDefaultResource(),
                id: resId,
                metadata: {
                  type: 'webpage',
                  createdAt: new Date().getTime(),
                  lastModifiedAt: new Date().getTime(),
                  title: text,
                },
                data: {
                  url,
                }
              };
              contextualizer = {
                id: contextualizerId,
                type: 'webpage',
                // alias: text,
                insertionType: 'inline'
              };
              contextualization = {
                id: contextualizationId,
                resourceId: resId,
                contextualizerId,
                sectionId: activeSectionId,
                type: 'webpage',
              };
            }

            if (shouldCreateResource) {
              createResource({storyId, resourceId: resId, resource, userId});
            }
            createContextualizer({storyId, contextualizerId, contextualizer, userId});
            createContextualization({storyId, contextualizationId, contextualization, userId});
            mods.push({
              from,
              to,
              blockKey,
              contextualizationId,
              contextualizer,
            });
          }
        );
      });
    // reversing modifications to content state
    // to avoid messing with indexes
    mods.reverse().forEach(({from, to, blockKey, contextualizationId, contextualizer}) => {
      const textSelection = new SelectionState({
        anchorKey: blockKey,
        anchorOffset: from,
        focusKey: blockKey,
        focusOffset: to,
        collapsed: true
      });

      // contentState = Modifier.replaceText(
      //   contentState,
      //   textSelection,
      //   ' ',
      // );
      contentState = contentState.createEntity(
        INLINE_ASSET,
        contextualizer.type === 'bib' ? 'IMMUTABLE' : 'MUTABLE',
        {
          asset: {
            id: contextualizationId,
          }
        }
      );
      const entityKey = contentState.getLastCreatedEntityKey();
      // update selection
      // textSelection = textSelection.merge({
      //   focusOffset: from + 1
      // });
      try {
        contentState = Modifier.applyEntity(
          contentState,
          textSelection,
          entityKey
        );
      }
      catch (e) {/* eslint no-empty : 0 */

      }

    });
    // applying updated editor state
    activeEditorState = EditorState.push(
        activeEditorState,
        contentState,
        'apply-entity'
      );
    updateDraftEditorState(
      activeEditorStateId,
      activeEditorState,
    );
    // ...then update the section with editorStates convert to serializable raw objects
    let newSection;
    // console.log(convertToRaw(activeEditorState.getCurrentContent()));
    if (editorFocus === 'main') {
      newSection = {
        ...activeSection,
        contents: convertToRaw(activeEditorState.getCurrentContent()),
      };
    }
    else {
      newSection = {
        ...activeSection,
        notes: {
          ...activeSection.notes,
          [activeEditorStateId]: {
            ...activeSection.notes[activeEditorStateId],
            contents: convertToRaw(activeEditorState.getCurrentContent()),
          }
        }
      };
    }
    updateSection(newSection);

    return;
};

export default pasteFromOutside;
