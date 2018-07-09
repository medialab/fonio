import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  CharacterMetadata,
  SelectionState,
  Modifier,
} from 'draft-js';

import {v4 as generateId} from 'uuid';

import {
  getSelectedBlocksList
} from 'draftjs-utils';

import {stateToHTML} from 'draft-js-export-html';

import {
  utils,
  constants
} from 'scholar-draft';

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


/**
 * Prepares data within component's state for later pasting
 * @param {event} e - the copy event
 */
export const handleCopy = function(event) {
    const {
      props,
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

    // we are going to parse draft-js ContentBlock objects
    // and store separately non-textual objects that needs to be remembered
    // (entities, notes, inline assets, block assets)
    selectedBlocksList.forEach(contentBlock => {
      const block = contentBlock.toJS();
      const entitiesIds = block.characterList.filter(char => char.entity).map(char => char.entity);
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
                  copiedContextualizations.push({
                    ...contextualizations[eData.data.asset.id]
                  });
                }
              });
              return true;
            });
          }
        }
        // copying asset entities and related contextualization & contextualizer
        // todo: question - should we store as well the resources being copied ?
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
      copiedNotes
    };

    const tempEditorState = EditorState.createEmpty();

    const clipboardContentState = Modifier.replaceWithFragment(
      tempEditorState.getCurrentContent(),
      tempEditorState.getSelection(),
      clipboard
    );
    const plainText = clipboardContentState.getPlainText();

    copiedData.clipboardContentState = convertToRaw(clipboardContentState);

    const clipboardHtml = `
      ${stateToHTML(clipboardContentState)}
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
      setEditorFocus,
      userId,
    } = props;

    const {
      id: storyId,
      resources
    } = story;


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
          let src;
          let alt;
          let entityKey;
          contentBlock.findEntityRanges(
            (character) => {
              entityKey = character.getEntity();
              if (
                entityKey !== null &&
                contentState.getEntity(entityKey).getType() === 'LINK'
              ) {
                url = contentState.getEntity(entityKey).getData().url;
                return true;
              }
              else if (
                entityKey !== null &&
                contentState.getEntity(entityKey).getType() === 'IMAGE'
                ) {
                 src = contentState.getEntity(entityKey).getData().src;
                 alt = contentState.getEntity(entityKey).getData().alt;
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
              if (url) {
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
              else if (src) {
                const selectionState = activeEditorState.getSelection().merge({
                  anchorKey: blockKey,
                  focusKey: blockKey,
                  anchorOffset: from,
                  focusOffset: to,
                });

                // we remove the IMAGE entity
                contentState = Modifier.applyEntity(
                  contentState,
                  selectionState,
                  null
                );
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
                  id: resId,
                  metadata: {
                    type: 'webpage',
                    createdAt: new Date().getTime(),
                    lastModifiedAt: new Date().getTime(),
                    title: text,
                  },
                  data: {
                    url,
                    name: text
                  }
                };
                contextualizer = {
                  id: contextualizerId,
                  type: 'webpage',
                  alias: text,
                  insertionType: 'inline'
                };
                contextualization = {
                  id: contextualizationId,
                  resourceId: resId,
                  contextualizerId,
                  type: 'image',
                  title: alt
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
              });
            }
          );
        });
      // reversing modifications to content state
      // to avoid messing with indexes
      mods.reverse().forEach(({from, to, blockKey, contextualizationId}) => {
        let textSelection = new SelectionState({
          anchorKey: blockKey,
          anchorOffset: from,
          focusKey: blockKey,
          focusOffset: to,
          collapsed: true
        });

        contentState = Modifier.replaceText(
          contentState,
          textSelection,
          ' ',
        );
        contentState = contentState.createEntity(
          INLINE_ASSET,
          'IMMUTABLE',
          {
            asset: {
              id: contextualizationId,
            }
          }
        );
        const entityKey = contentState.getLastCreatedEntityKey();
        // update selection
        textSelection = textSelection.merge({
          focusOffset: from + 1
        });
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
      updateSection({storyId, sectionId: activeSectionId, section: newSection, userId});


      return;
    }
    // case 2 : comes from inside
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
    // let newClipboard = clipboard;// clipboard entities will have to be updated
    let newClipboard = convertFromRaw(copiedData.clipboardContentState).getBlockMap();// clipboard entities will have to be updated

    // case: some non-textual data has been saved to the clipboard
    if (typeof copiedData === 'object') {
        const data = copiedData;
        // past assets/contextualizations (attributing them a new id)
        if (data.copiedContextualizations) {
          data.copiedContextualizations.forEach(contextualization => {
            createContextualization({storyId, contextualizationId: contextualization.id, contextualization, userId});
          });
        }
        // paste contextualizers (attributing them a new id)
        if (data.copiedContextualizers) {
          data.copiedContextualizers.forEach(contextualizer => {
            createContextualizer({storyId, contextualizerId: contextualizer.id, contextualizer, userId});
          });
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
        // editorStates as stored as a map in which each keys corresponds
        // to a category of content ('main' or uuids for each note)
        if (Object.keys(data.copiedEntities).length) {
          // update entities data with correct notes and contextualizations ids pointers
          const copiedEntities = Object.keys(data.copiedEntities).reduce((result, contentId) => {
            return {
              ...result,
              [contentId]: data.copiedEntities[contentId].map(inputEntity => {
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
                else if (data.asset && data.asset.id) {
                  const id = Object.keys(copiedData.copiedContextualizations).find(key => {
                    if (copiedData.copiedContextualizations[key].oldId === data.asset.id) {
                      return true;
                    }
                  });
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

          // iterating through all the entities and adding them to the new editor state
          Object.keys(copiedEntities).forEach(contentId => {
            if (contentId === 'main') {
              // iterating through the main editor's copied entities
              copiedEntities[contentId].forEach(entity => {
                const editorState = editorStates[activeSectionId];

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
                    if (char.getEntity() && char.getEntity() === entity.key) {
                      return CharacterMetadata.applyEntity(char, newEntityKey);
                    }
                    return char;
                  });
                  return block.set('characterList', newCharacters); // block;
                });
              });
            }
            // iterating through a note's editor's copied entities
            // to update its entities and the clipboard
            else if (newNotes[contentId]) {
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
                    if (char.getEntity() && char.getEntity() === entity.key) {
                      return CharacterMetadata.applyEntity(char, newEntityKey);
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
    updateSection({storyId, sectionId: activeSectionId, section: newSection, userId});
    setEditorFocus(undefined);
    setTimeout(() => setEditorFocus(editorFocus));
    event.preventDefault();
  };
