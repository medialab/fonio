import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  CharacterMetadata
} from 'draft-js';

import {v4 as generateId} from 'uuid';

import {
  getSelectedBlocksList
} from 'draftjs-utils';

import {
  utils,
  constants
} from 'scholar-draft';

const {
  NOTE_POINTER,
  SCHOLAR_DRAFT_CLIPBOARD_CODE
} = constants;

const {
  updateNotesFromEditor,
  insertFragment,
} = utils;


/**
 * Prepares data within component's state for later pasting
 * @param {event} e - the copy event
 */
export const handleCopy = (props, state, setState, editor, event) => {
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
      activeStory
    } = props;
    const {
      contextualizations,
      contextualizers,
      // resources
    } = activeStory;

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
          const noteContent = editorStates[noteId].getCurrentContent();
          // note content is storied as a raw representation
          const rawContent = convertToRaw(noteContent);
          copiedEntities[noteId] = [];
          copiedNotes.push({
            id: noteId,
            rawContent
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
        // copying asset entities and related contextualization & contextualizer
        // todo: question - should we store as well the resources being copied ?
        // (in case the resource being copied is deleted by the time)
        else {
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

    event.clipboardData.setData('text/plain', SCHOLAR_DRAFT_CLIPBOARD_CODE);
    stateDiff.copiedData = copiedData;
    setState(stateDiff);
    event.preventDefault();
  };


  /**
   * Handles pasting command in the editor
   * @param {event} e - the copy event
   */
  export const handlePaste = (props, state, setState, editor, event) => {
    // ensuring this is happening while editing the content
    if (!props.editorFocus) {
      return;
    }

    const {
      activeStoryId,
      editorFocus,
      activeSection,
      editorStates,
      createContextualization,
      createContextualizer,
      // createResource,
      updateDraftEditorsStates,
      updateSection,
    } = props;

    const {
      notes
    } = activeSection;

    const activeSectionId = activeSection.id;

    const {
      clipboard, // blockMap of the data copied to clipboard
      copiedData, // model-dependent set of data objects saved to clipboard
    } = state;

    // this hack allows to check if data comes from outside of the editor
    // case 1 : comes from outside
    if (!clipboard || event.clipboardData.getData('text/plain') !== SCHOLAR_DRAFT_CLIPBOARD_CODE) {
      // clear components "internal clipboard" and let the event happen
      // normally (it is in this case draft-js which will handle the paste process)
      // as a editorChange event (will handle clipboard content as text or html)
      setState({
        clipboard: null,
        copiedData: null
      });
      return;
    }
    else {
      // if contents comes from scholar-draft, prevent default
      // because we are going to handle the paste process manually
    }

    // let editorState;
    let newNotes;
    let newClipboard = clipboard;// clipboard entities will have to be updated


    // case: some non-textual data has been saved to the clipboard
    if (typeof copiedData === 'object') {
        const data = copiedData;
        // past assets/contextualizations (attributing them a new id)
        if (data.copiedContextualizations) {
          data.copiedContextualizations.forEach(contextualization => {
            createContextualization(activeStoryId, contextualization.id, contextualization);
          });
        }
        // past contextualizers (attributing them a new id)
        if (data.copiedContextualizers) {
          data.copiedContextualizers.forEach(contextualizer => {
            createContextualizer(activeStoryId, contextualizer.id, contextualizer);
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
                editorState: EditorState.createWithContent(convertFromRaw(notes[noteId].editorState), editor.mainEditor.createDecorator()),
              }
            };
          }, {});
          // now we attribute to new notes a new id (to handle possible duplicates)
          // and merge them with the past notes
          newNotes = data.copiedNotes.reduce((result, note) => {
            const id = generateId();
            // console.log('attributing new node id', id);
            const noteEditorState = EditorState.createWithContent(convertFromRaw(note.rawContent), editor.mainEditor.createDecorator());
            return {
              ...result,
              [id]: {
                ...note,
                editorState: noteEditorState,
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
        // to a category of content ('main' + uuids for each note)
        if (Object.keys(data.copiedEntities).length) {
          // update entities data with correct notes and contextualizations ids pointers
          const copiedEntities = Object.keys(data.copiedEntities).reduce((result, contentId) => {
            return {
              ...result,
              [contentId]: data.copiedEntities[contentId].map(inputEntity => {
                const entity = {...inputEntity};
                const thatData = entity.entity.data;
                // case: copying note entity
                if (thatData && data.noteId) {
                  const id = Object.keys(newNotes).find(key => {
                    if (newNotes[key].oldId === data.noteId) {
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
            else {
              copiedEntities[contentId].forEach(entity => {
                const editorState = newNotes[contentId].editorState;

                newContentState = editorState.getCurrentContent();
                newContentState = newContentState.createEntity(entity.entity.type, entity.entity.mutability, {...entity.entity.data});
                // update related entity in content
                newContentState.getBlockMap().map(block => {
                  block.getCharacterList().map(char => {
                    if (char.getEntity()) {
                      const ent = newContentState.getEntity(char.getEntity());
                      const eData = ent.getData();
                      if (eData.asset && eData.asset.id && eData.asset.id === entity.entity.data.asset.oldId) {
                        newContentState = newContentState.mergeEntityData(char.getEntity(), {
                          ...entity.entity.data
                        });
                      }
                    }
                  });
                });
                newNotes[contentId].editorState = EditorState.push(
                  editor,
                  newContentState,
                  'create-entity'
                );
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
    let notesOrder;
    // case pasting target is the main editor
    if (editorFocus === 'main') {
      mainEditorState = insertFragment(mainEditorState, newClipboard);
      const {newNotes: newNewNotes, notesOrder: newNotesOrder} = updateNotesFromEditor(mainEditorState, newNotes);
      newNotes = newNewNotes;
      notesOrder = newNotesOrder;
    }
    // case pasting target is a note editor
    else {
      newNotes = {
        ...Object.keys(newNotes).reduce((convertedNotes, noteId) => {
          const note = newNotes[noteId];
          return {
            ...convertedNotes,
            [noteId]: {
              ...note,
              editorState: editorStates[noteId],
            }
          };
        }, {}),
        [editorFocus]: {
          ...newNotes[editorFocus],
          editorState: insertFragment(
            EditorState.createWithContent(
              convertFromRaw(newNotes[editorFocus].editorState),
              editor.mainEditor.createDecorator()
            ),
            newClipboard
          )
        }
      };
    }

    newNotes = Object.keys(newNotes).reduce((result, noteId) => {
      const note = newNotes[noteId];
      delete note.oldId;
      return {
        ...result,
        [noteId]: note
      };
    }, {});

    // all done ! now we batch-update all the editor states ...
    const newEditorStates = Object.keys(newNotes).reduce((editors, noteId) => {
      return {
        ...editors,
        [noteId]: newNotes[noteId].editorState
      };
    }, {[activeSectionId]: mainEditorState});

    updateDraftEditorsStates(newEditorStates);

    // ...then update the section with editorStates convert to serializable raw objects
    const newSection = {
      ...activeSection,
      contents: convertToRaw(mainEditorState.getCurrentContent()),
      notesOrder,
      notes: Object.keys(newNotes).reduce((result, noteId) => {
        return {
          ...result,
          [noteId]: {
            ...newNotes[noteId],
            editorState: convertToRaw(newNotes[noteId].editorState.getCurrentContent())
          }
        };
      }, {})
    };
    updateSection(activeStoryId, activeSectionId, newSection);
    event.preventDefault();
  };
