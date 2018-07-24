import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  CharacterMetadata,
  SelectionState,
  Modifier,
} from 'draft-js';

import {uniq} from 'lodash';

import CSL from 'citeproc';

import {Parser} from 'html-to-react';

import {v4 as generateId} from 'uuid';
import {renderToStaticMarkup} from 'react-dom/server';

import {
  getSelectedBlocksList
} from 'draftjs-utils';

import {stateToHTML} from 'draft-js-export-html';
import {createDefaultResource} from '../../helpers/schemaUtils';


import {
  getCitationModels,
} from './citationUtils';

import {
  utils,
  constants
} from 'scholar-draft';


const htmlToReactParser = new Parser();

const {
  NOTE_POINTER,
  // SCHOLAR_DRAFT_CLIPBOARD_CODE,
  INLINE_ASSET,
  BLOCK_ASSET,
} = constants;

const {
  updateNotesFromEditor,
  insertFragment,
} = utils;

const makeReactCitations = (processor, cits) => {
  return cits.reduce((inputCitations, citationData) => {
    const citations = {...inputCitations};
    const citation = citationData[0];
    const citationsPre = citationData[1];
    const citationsPost = citationData[2];
    let citationObjects = processor.processCitationCluster(citation, citationsPre, citationsPost);
    citationObjects = citationObjects[1];
    citationObjects.forEach(cit => {
      const order = cit[0];
      const html = cit[1];
      const ThatComponent = htmlToReactParser.parse(cit[1]);
      const citationId = cit[2];
      citations[citationId] = {
        order,
        html,
        Component: ThatComponent
      };
    });
    return citations;
  }, {});
};


/**
 * Prepares data within component's state for later pasting
 * @param {event} e - the copy event
 */
export const handleCopy = function(event) {
    const {
      props,
      state: {
        citations,
      },
      editor
    } = this;
    const setState = this.setState.bind(this);
    // ensuring user is editing the contents
    if (!props.editorFocus) {
      return;
    }
    // we store entities data as a js object in order to reinject them in editor states later one
    const copiedEntities = {};
    const copiedNotes = [];
    const copiedContextualizers = [];
    const copiedContextualizations = [];

    let clipboard = null;
    let editorState;
    // we will store all state modifications in this object
    // and apply all at once then
    const stateDiff = {};

    const {
      editorFocus,
      activeSection,
      editorStates,
      story,
    } = props;
    const {
      contextualizations,
      contextualizers,
      // resources
    } = story;

    // first step is to retrieve draft-made clipboard ImmutableRecord
    // and proper editor state (wether copy event comes from a note or the main content)
    // case 1: data is copied from the main editor
    if (editorFocus === 'main') {
      clipboard = editor.mainEditor.editor.getClipboard();
      editorState = editorStates[activeSection.id];
    // case 2: data is copied from a note
    }
    else {
      editorState = editorStates[editorFocus];
      clipboard = editor.notes[editorFocus].editor.editor.getClipboard();
    }
    // bootstrapping the list of copied entities accross editors
    copiedEntities[editorFocus] = [];
    const currentContent = editorState.getCurrentContent();
    // this function comes from draft-js-utils - it returns
    // a fragment of content state that correspond to currently selected text
    const selectedBlocksList = getSelectedBlocksList(editorState);

    stateDiff.clipboard = clipboard;
    const selection = editorState.getSelection().toJS();
    // we are going to parse draft-js ContentBlock objects
    // and store separately non-textual objects that needs to be remembered
    // (entities, notes, inline assets, block assets)
    selectedBlocksList.forEach((contentBlock, blockIndex) => {
      const block = contentBlock.toJS();
      let charsToParse;
      if (blockIndex === 0 && selectedBlocksList.size === 1) {
        charsToParse = block.characterList.slice(selection.anchorOffset, selection.focusOffset);
      }
      else if (blockIndex === 0) {
        charsToParse = block.characterList.slice(selection.anchorOffset);
      }
      else if (blockIndex === selectedBlocksList.size - 1) {
        charsToParse = block.characterList.slice(0, selection.focusOffset);
      }
      else {
        charsToParse = block.characterList;
      }
      const entitiesIds = uniq(charsToParse.filter(char => char.entity).map(char => char.entity));
      let entity;
      let eData;
      entitiesIds.forEach(entityKey => {
        entity = currentContent.getEntity(entityKey);
        eData = entity.toJS();
        // draft-js entities are stored separately
        // because we will have to re-manipulate them (ie. attribute a new target id)
        // when pasting later on
        copiedEntities[editorFocus].push({
          key: entityKey,
          entity: eData
        });
        const type = eData.type;
        // copying note pointer and related note
        if (type === NOTE_POINTER) {
          const noteId = eData.data.noteId;
          const noteEditorState = editorStates[noteId];
          if (noteEditorState && eData.data.noteId) {
            const noteContent = noteEditorState.getCurrentContent();
            // note content is storied as a raw representation
            const rawContent = convertToRaw(noteContent);
            copiedEntities[noteId] = [];
            copiedNotes.push({
              id: noteId,
              contents: rawContent
            });
            // copying note's entities
            noteContent.getBlockMap().forEach(thatBlock => {
              thatBlock.getCharacterList().map(char => {
                // copying note's entity and related contextualizations
                if (char.entity) {
                  entityKey = char.entity;
                  entity = currentContent.getEntity(entityKey);
                  eData = entity.toJS();
                  copiedEntities[noteId].push({
                    key: entityKey,
                    entity: eData
                  });
                  const contextualization = contextualizations[eData.data.asset.id];
                  copiedContextualizations.push({
                    ...contextualization
                  });
                  copiedContextualizers.push({
                    ...contextualizers[contextualization.contextualizerId],
                    id: contextualization.contextualizerId
                  });
                }
              });
              return true;
            });
          }
        }
        // copying asset entities and related contextualization & contextualizer
        // @todo: question - should we store as well the resources being copied ?
        // (in case the resource being copied is deleted by the time)
        else if (type === INLINE_ASSET || type === BLOCK_ASSET) {
          const assetId = entity.data.asset.id;
          const contextualization = contextualizations[assetId];
          copiedContextualizations.push({...contextualization});
          copiedContextualizers.push({
            ...contextualizers[contextualization.contextualizerId],
            id: contextualization.contextualizerId
          });
        }
      });
      return true;
    });

    // this object stores all the stuff we need to paste content later on
    const copiedData = {
      copiedEntities,
      copiedContextualizations,
      copiedContextualizers,
      copiedNotes,
      contentId: editorFocus
    };

    const tempEditorState = EditorState.createEmpty();

    const {locale: citationLocale, style: citationStyle} = getCitationModels(story);

    /**
     * citeproc scaffolding
     */
    const sys = {
      retrieveLocale: () => {
        return citationLocale;
      },
      retrieveItem: (id) => {
        return citations.citationItems[id];
      },
      variableWrapper: (params, prePunct, str, postPunct) => {
        if (params.variableNames[0] === 'title'
            && params.itemData.URL
            && params.context === 'bibliography') {
          return prePunct
             + '<a href="'
               + params.itemData.URL
             + '" target="blank">'
               + str
             + '</a>'
               + postPunct;
        }
        else if (params.variableNames[0] === 'URL') {
          return prePunct
             + '<a href="'
               + str
             + '" target="blank">'
               + str
             + '</a>'
               + postPunct;
        }
        else {
          return (prePunct + str + postPunct);
        }
      }
    };

    let clipboardContentState = Modifier.replaceWithFragment(
      tempEditorState.getCurrentContent(),
      tempEditorState.getSelection(),
      clipboard
    );

    const plainText = clipboardContentState.getPlainText();

    /**
     * This is the content state that will be parsed if content is pasted internally
     */
    copiedData.clipboardContentState = convertToRaw(clipboardContentState);

    /**
     * convrerting bib references to string so that they
     * can be pasted in another editor
     */
    const processor = new CSL.Engine(sys, citationStyle);

    const reactCitations = makeReactCitations(processor, citations.citationData);

    clipboardContentState.getBlocksAsArray()
      .forEach(block => {
        const characters = block.getCharacterList();
        const blockKey = block.getKey();
          characters.forEach((char, index) => {
            if (char.getEntity()) {
              const thatEntityKey = char.getEntity();
              const thatEntity = clipboardContentState.getEntity(thatEntityKey).toJS();
              if (thatEntity.type === INLINE_ASSET) {
                const targetId = thatEntity && thatEntity.data.asset.id;
                const contextualization = story.contextualizations[targetId];
                const contextualizer = story.contextualizers[contextualization.contextualizerId];
                if (contextualizer.type === 'bib' && reactCitations[contextualization.id]) {
                  const component = reactCitations[contextualization.id].Component;
                  const content = renderToStaticMarkup(component).replace(/<(?:.|\n)*?>/gm, '');
                  clipboardContentState = Modifier.replaceText(
                    clipboardContentState,
                    tempEditorState.getSelection().merge({
                      anchorKey: blockKey,
                      focusKey: blockKey,
                      anchorOffset: index,
                      focusOffset: index + 1,
                    }),
                    content
                  );
                }
              }
            }
          });
      });

    const toHTMLOptions = {
      entityStyleFn: entity => {
        const data = entity.getData();
        if (data.asset && data.asset.id) {
          const contextualization = story.contextualizations[data.asset.id];
          const contextualizer = story.contextualizers[contextualization.contextualizerId];
          const resource = story.resources[contextualization.resourceId];
          switch (contextualizer.type) {
            case 'webpage':
              return {
                element: 'a',
                attributes: {
                  href: resource.data.url,
                }
              };
            case 'glossary':
              return {
                element: 'cite',
              };
            case 'bib':
            default:
              return {
                element: 'cite',
              };
          }
        }
        return null;
      }
    };

    const clipboardHtml = `
      ${stateToHTML(clipboardContentState, toHTMLOptions)}
      <script id="fonio-copied-data" type="application/json">
       ${JSON.stringify(copiedData)}
      </script>
    `.split('\n').join('').trim();
    event.clipboardData.setData('text/plain', plainText);
    event.clipboardData.setData('text/html', clipboardHtml);


    // event.clipboardData.setData('text/plain', SCHOLAR_DRAFT_CLIPBOARD_CODE);
    stateDiff.copiedData = copiedData;
    setState(stateDiff);
    event.preventDefault();
  };


  /**
   * Handles pasting command in the editor
   * @param {event} e - the copy event
   */
  export const handlePaste = function(event) {
    const {
      props,
      state,
      editor
    } = this;
    // const setState = this.setState.bind(this);
    // ensuring this is happening while editing the content
    if (!props.editorFocus) {
      return;
    }

    const {
      story,
      editorFocus,
      activeSection,
      editorStates,
      createContextualization,
      createContextualizer,
      createResource,
      updateDraftEditorsStates,
      updateDraftEditorState,
      updateSection,
      // setEditorFocus,
      userId,
    } = props;

    const {
      id: storyId,
      resources
    } = story;

    if (!Object.keys(editorStates).length) return;


    const {
      notes,
      id: activeSectionId
    } = activeSection;

    const {
      // clipboard, // blockMap of the data copied to clipboard
      // copiedData, // model-dependent set of data objects saved to clipboard
    } = state;

    let copiedData;

    const html = event.clipboardData.getData('text/html');

    const activeEditorStateId = editorFocus === 'main' ? activeSectionId : editorFocus;
    let activeEditorState = editorStates[activeEditorStateId];


    // check whether the clipboard contains fonio data
    const dataRegex = /<script id="fonio-copied-data" type="application\/json">(.*)<\/script>$/gm;
    const hasScript = dataRegex.test(html);
    // case 1 : comes from outside (no fonio data)
    if (!hasScript) {
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
        contentState = Modifier.applyEntity(
          contentState,
          textSelection,
          entityKey
        );
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
    }
    // case 2 : pasting comes from inside the editor
    else {
      // if contents comes from scholar-draft, prevent default
      // because we are going to handle the paste process manually

      try {
        // copiedData = JSON.parse(dataRegex.match(html)[1]);
       let json;
       let match = html.match(dataRegex);
       // if (match) {
       //  match = match[0].substr(`<script id="fonio-copied-data" type="application/json">`.length, html.length - `</script>`.length);
       //  console.log('match', match);
       // }

        while ((match = dataRegex.exec(html)) !== null) {
          json = match[1];
          // console.log(`Found ${match[1]}. Next starts at ${match.lastIndex}.`);
          // expected output: "Found foo. Next starts at 9."
          // expected output: "Found foo. Next starts at 19."
        }
        copiedData = JSON.parse(json);
      }
       catch (e) {
        // console.log('e', e);
      }
    }
    if (!copiedData) {
      return;
    }


    // let editorState;
    let newNotes;
    let newClipboard = convertFromRaw(copiedData.clipboardContentState).getBlockMap();// clipboard entities will have to be updated


    // case: some non-textual data (contextualizations, notes pointers, that kind of things) has been saved to the clipboard
    if (typeof copiedData === 'object') {
        const data = copiedData;

        const invalidEntities = [];

        // filter out contextualizations that point to a resource that has been deleted
        data.copiedContextualizations = data.copiedContextualizations.filter(contextualization => {
          const isValid = story.resources[contextualization.resourceId] !== undefined;
          if (!isValid) {
            data.copiedContextualizers = data.copiedContextualizers.filter(contextualizer => {
              return contextualizer.id !== contextualization.contextualizerId;
            });
          }
          return isValid;
        });

        // paste contextualizers (attributing them a new id)
        if (data.copiedContextualizers) {
          data.copiedContextualizers.forEach((contextualizer, index) => {
            const contextualizerId = generateId();
            data.copiedContextualizations = data.copiedContextualizations.map(c => {
              if (c.contextualizerId === contextualizer.id) {
                return {
                  ...c,
                  contextualizerId
                };
              }
              return c;
            });
            createContextualizer({storyId, contextualizerId, contextualizer: {...contextualizer, id: contextualizerId}, userId});
            data.copiedContextualizers[index] = {
              ...contextualizer,
              oldId: contextualizer.id,
              id: contextualizerId
            };
          });
        }
        // paste assets/contextualizations (attributing them a new id)
        if (data.copiedContextualizations) {
          data.copiedContextualizations.forEach((contextualization, index) => {
            const contextualizationId = generateId();
            createContextualization({storyId, contextualizationId, contextualization: {
              ...contextualization,
              id: contextualizationId,
              sectionId: activeSection.id
            }, userId});
            data.copiedContextualizations[index] = {
              ...contextualization,
              oldId: contextualization.id,
              id: contextualizationId
            };
          });
        }

        // filter out entities that are related to incorrect contextualizations
        data.copiedEntities = Object.keys(data.copiedEntities)
        .reduce((result, contentId) => {
          return {
            ...result,
            [contentId]: data.copiedEntities[contentId]
              .filter(entity => {

                const thatData = entity.entity.data;
                // verifying that asset points to a contextualization
                if (thatData.asset && thatData.asset.id) {
                  const thatContextualization = data.copiedContextualizations.find(c => c.oldId === thatData.asset.id);
                  const isValid = thatContextualization !== undefined;
                  if (!isValid) {
                    invalidEntities.push(thatData.asset.id);
                  }
                  return isValid;
                }
                return true;
              })
            };
          }, {});
        // retargeting main editor source
        if (data.contentId !== editorFocus) {
          data.copiedEntities[editorFocus] = data.copiedEntities[data.contentId];
          delete data.copiedEntities[data.contentId];
        }

        // paste notes (attributing them a new id to duplicate them if in situation of copy/paste)
        if (data.copiedNotes && editorFocus === 'main') {
          // we have to convert existing notes contents
          // as EditorState objects to handle past and new notes
          // the same way
          const pastNotes = Object.keys(notes).reduce((result, noteId) => {
            return {
              ...result,
              [noteId]: {
                ...notes[noteId],
                // contents: EditorState.createWithContent(convertFromRaw(notes[noteId].contents), editor.mainEditor.createDecorator()),
              }
            };
          }, {});
          // now we attribute to new notes a new id (to handle possible duplicates)
          // and merge them with the past notes
          newNotes = data.copiedNotes.reduce((result, note) => {
            const id = generateId();
            return {
              ...result,
              [id]: {
                ...note,
                oldId: note.id,
                // filter out invalid entities in copied notes
                contents: {
                  ...note.contents,
                  entityMap: Object.keys(note.contents.entityMap).reduce((res, entityKey) => {
                    const entity = note.contents.entityMap[entityKey];
                    const assetId = entity.data && entity.data.asset && entity.data.asset.id;
                    if (entity.type === NOTE_POINTER || !assetId || invalidEntities.length === 0 || invalidEntities.indexOf(assetId) > -1) {
                      return {
                        ...res,
                        [entityKey]: note.contents.entityMap[entityKey]
                      };
                    }
                    return res;
                  }, {})
                },
                id
              }
            };
          }, {
            ...pastNotes
          });

          // we now have to update copied entities targets
          // for entities stored in pasted notes
          data.copiedEntities = Object.keys(data.copiedEntities)
          // reminder : copiedEntities is a map of editors (main + notes)
          // that have been copied.
          // We therefore iterate in this map
          .reduce((result, id) => {
            // we are interested in updating only the entities in the main
            // because it is only there that there are note pointers entities
            if (id !== 'main') {
              // looking for note pointers that were attached
              // to the original copied note in order to update them
              // with the newly given note id
              const noteId = Object.keys(newNotes)
                .find(thatNoteId => {
                  const note = newNotes[thatNoteId];
                  return note.oldId === id;
                });
              // if the target note is a "ghost" one
              // (i.e. linked to an old note id), attribute correct id
              if (noteId && newNotes[noteId].oldId) {
                // console.info('reattributing entity to note id', newNotes[noteId].id);
                return {
                  ...result,
                  [newNotes[noteId].id]: data.copiedEntities[newNotes[noteId].oldId]
                };
              }
            }
            return {
              ...result,
              [id]: data.copiedEntities[id]
            };
          }, {});
        }
        else {
          newNotes = notes;
        }


        // integrate new draftjs entities in respective editorStates
        // editorStates are stored as a map in which each keys corresponds
        // to a category of content ('main' for main contents or uuids for each note)
        if (Object.keys(data.copiedEntities).length) {

          // update entities data with correct notes and contextualizations ids pointers
          const copiedEntities = Object.keys(data.copiedEntities)
          .reduce((result, contentId) => {
            return {
              ...result,
              [contentId]: data.copiedEntities[contentId]
                .map(inputEntity => {
                const entity = {...inputEntity};
                const thatData = entity.entity.data;
                // case: copying note entity
                if (thatData && thatData.noteId) {
                  const id = Object.keys(newNotes).find(key => {
                    if (newNotes[key].oldId === thatData.noteId) {
                      return true;
                    }
                  });
                  if (id) {
                    // attributing new id
                    return {
                      ...entity,
                      entity: {
                        ...entity.entity,
                        data: {
                          ...thatData,
                          noteId: id
                        }
                      }
                    };
                  }
                }
                // case: copying asset entity
                else if (thatData.asset && thatData.asset.id) {
                  let id = Object.keys(copiedData.copiedContextualizations).find(key => {
                    if (copiedData.copiedContextualizations[key].oldId === thatData.asset.id) {
                      return true;
                    }
                  });
                  if (id) {
                    id = copiedData.copiedContextualizations[id].id;
                  }
                  if (id) {
                    return {
                      ...entity,
                      entity: {
                        ...entity.entity,
                        data: {
                          ...entity.entity.data,
                          asset: {
                            ...entity.entity.data.asset,
                            oldId: entity.entity.data.asset.id,
                            id
                          }
                        }
                      }
                    };
                  }
                }
                return entity;
              })
            };
          }, {});

          let newContentState;

          const realEditorFocus = editorFocus === 'main' ? activeSectionId : editorFocus;
          newContentState = editorStates[realEditorFocus].getCurrentContent();
          // cleaning the clipboard of invalid entities
          newClipboard = newClipboard.map(block => {
            const characters = block.getCharacterList();
            const newCharacters = characters.map(char => {
              if (char.getEntity()) {
                const thatEntityKey = char.getEntity();
                const thatEntity = newContentState.getEntity(thatEntityKey).toJS();
                if (thatEntity.type === BLOCK_ASSET || thatEntity.type === INLINE_ASSET) {
                  const targetId = thatEntity && thatEntity.data.asset.id;

                  if (invalidEntities.length > 0 && invalidEntities.indexOf(targetId) > -1) {
                    return CharacterMetadata.applyEntity(char, null);
                  }
                }
              }
              return char;
            });
            return block.set('characterList', newCharacters); // block;
          });

          // iterating through all the entities and adding them to the new editor states
          Object.keys(copiedEntities).forEach(contentId => {
            // if (contentId === 'main') {
              // iterating through the main editor's copied entities
              copiedEntities[contentId].forEach(entity => {
                // if (contentId === editorFocus) {
                  const eId = contentId === 'main' ? activeSectionId : editorFocus;
                  const editorState = editorStates[eId];

                  if (!editorState) {
                    return;
                  }

                  newContentState = editorState.getCurrentContent();
                  newContentState = newContentState.createEntity(entity.entity.type, entity.entity.mutability, {...entity.entity.data});
                  // const newEditorState = EditorState.push(
                  //   editor,
                  //   newContentState,
                  //   'create-entity'
                  // );
                  const newEntityKey = newContentState.getLastCreatedEntityKey();
                  // updating the related clipboard
                  newClipboard = newClipboard.map(block => {
                    const characters = block.getCharacterList();
                    const newCharacters = characters.map(char => {
                      if (char.getEntity()) {
                        const thatEntityKey = char.getEntity();
                        const thatEntity = newContentState.getEntity(thatEntityKey).toJS();
                        if (entity.entity.type === NOTE_POINTER && thatEntity.type === NOTE_POINTER) {
                          if (contentId !== 'main') {
                            return CharacterMetadata.applyEntity(char, null);
                          }
                          const entityNoteId = entity.entity.data.noteId;
                          const newNoteOldId = newNotes[entityNoteId] && newNotes[entityNoteId].oldId;
                          if (newNoteOldId === thatEntity.data.noteId) {
                            return CharacterMetadata.applyEntity(char, newEntityKey);
                          }
                        }
                        else if ((entity.entity.type === BLOCK_ASSET || entity.entity.type === INLINE_ASSET) && (thatEntity.type === BLOCK_ASSET || thatEntity.type === INLINE_ASSET)) {
                          const targetId = thatEntity && thatEntity.data.asset.id;
                          if (invalidEntities.length > 0 && invalidEntities.indexOf(targetId) > -1) {
                            return CharacterMetadata.applyEntity(char, null);
                          }
                          else if (targetId === entity.entity.data.asset.oldId) {
                            return CharacterMetadata.applyEntity(char, newEntityKey);
                          }
                        }
                      }

                      return char;
                    });
                    return block.set('characterList', newCharacters); // block;
                  });
                // }
              });
            // }
            // iterating through a note's editor's copied entities
            // to update its entities and the clipboard
            if (newNotes[contentId]) {
              copiedEntities[contentId].forEach(entity => {
                const editorState = editorStates[contentId]
                  || EditorState.createWithContent(
                      convertFromRaw(newNotes[contentId].contents),
                      this.editor.mainEditor.createDecorator()
                    );
                newContentState = editorState.getCurrentContent();
                newContentState = newContentState.createEntity(entity.entity.type, entity.entity.mutability, {...entity.entity.data});
                // update related entity in content
                newContentState.getBlockMap().map(block => {
                  block.getCharacterList().map(char => {
                    if (char.getEntity()) {
                      const ent = newContentState.getEntity(char.getEntity());
                      const eData = ent.getData();
                      if (eData.asset && eData.asset.id && entity.entity.data.asset && eData.asset.id === entity.entity.data.asset.oldId) {
                        newContentState = newContentState.mergeEntityData(char.getEntity(), {
                          ...entity.entity.data
                        });
                      }
                    }
                  });
                });
                newNotes[contentId].contents = convertToRaw(EditorState.push(
                  editorState,
                  newContentState,
                  'create-entity'
                ).getCurrentContent());
                const newEntityKey = newContentState.getLastCreatedEntityKey();
                newClipboard = newClipboard.map(block => {
                  const characters = block.getCharacterList();
                  const newCharacters = characters.map(char => {
                    const thatEntityKey = char.getEntity();
                    if (thatEntityKey) {
                      const thatEntity = newContentState.getEntity(thatEntityKey).toJS();
                      if (thatEntity.type === BLOCK_ASSET || thatEntity.type === INLINE_ASSET) {
                        const targetId = thatEntity.data.asset.id;
                        // console.log(thatEntity, 'invalid ? ', invalidEntities.indexOf(targetId) > -1);
                        if (invalidEntities.length > 0 && invalidEntities.indexOf(targetId) > -1) {
                          return CharacterMetadata.applyEntity(char, null);
                        }
                        else if (thatEntityKey === entity.key) {
                          return CharacterMetadata.applyEntity(char, newEntityKey);
                        }
                      }
                    }
                    return char;
                  });
                  return block.set('characterList', newCharacters); // block;
                });
              });
            }
          });
        }
    }

    let mainEditorState = editorStates[activeSectionId];
    let notesOrder = activeSection.notesOrder;
    // case pasting target is the main editor
    if (editorFocus === 'main') {
      mainEditorState = insertFragment(mainEditorState, newClipboard);

      const {newNotes: newNewNotes, notesOrder: newNotesOrder} = updateNotesFromEditor(mainEditorState, newNotes);
      newNotes = newNewNotes;
      notesOrder = newNotesOrder;
    }
    // case pasting target is a note editor
    else {
      const noteEditorState = editorStates[editorFocus];
      newNotes = {
        ...Object.keys(newNotes).reduce((convertedNotes, noteId) => {
          const note = newNotes[noteId];
          return {
            ...convertedNotes,
            [noteId]: {
              ...note,
              // contents: editorStates[noteId],
            }
          };
        }, {}),
        [editorFocus]: {
          ...newNotes[editorFocus],
          contents: convertToRaw(
            insertFragment(noteEditorState, newClipboard)
            .getCurrentContent()
          )
          // contents: convertToRaw(insertFragment(
          //   EditorState.createWithContent(
          //     convertFromRaw(newNotes[editorFocus].contents),
          //     editor.mainEditor.createDecorator()
          //   ),
          //   newClipboard
          // ).getCurrentContent())
        }
      };
    }


    newNotes = Object.keys(newNotes).reduce((result, noteId) => {
      const note = newNotes[noteId];
      delete note.oldId;
      return {
        ...result,
        [noteId]: {...note}
      };
    }, {});


    // all done ! now we batch-update all the editor states ...
    const newEditorStates = Object.keys(newNotes).reduce((editors, noteId) => {
      return {
        ...editors,
        [noteId]: noteId === editorFocus ?
            EditorState.forceSelection(
              EditorState.createWithContent(convertFromRaw(newNotes[noteId].contents), editor.mainEditor.createDecorator()),
              editorStates[editorFocus].getSelection()
            )
            : EditorState.createWithContent(convertFromRaw(newNotes[noteId].contents), editor.mainEditor.createDecorator())
      };
    }, {[activeSectionId]: mainEditorState
    });

    updateDraftEditorsStates(newEditorStates);

    // ...then update the section with editorStates convert to serializable raw objects
    const newSection = {
      ...activeSection,
      contents: convertToRaw(mainEditorState.getCurrentContent()),
      notesOrder,
      notes: {
        ...activeSection.notes,
        ...Object.keys(newNotes).reduce((result, noteId) => {
              return {
                ...result,
                [noteId]: {
                  ...newNotes[noteId],
                }
              };
            }, {})
      }
    };
    updateSection(newSection);
    // updateSection({storyId, sectionId: activeSectionId, section: newSection, userId});
    // setEditorFocus(undefined);
    // setTimeout(() => setEditorFocus(editorFocus));
    event.preventDefault();
  };
