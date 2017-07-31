/**
 * This module provides a wrapper for displaying section editor in fonio editor
 * @module fonio/components/SectionEditor
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {debounce} from 'lodash';


import {ReferencesManager} from 'react-citeproc';

import {v4 as generateId} from 'uuid';

import {
  EditorState,
  Modifier,
  convertToRaw,
  convertFromRaw,
  CharacterMetadata
} from 'draft-js';

import {
  getSelectedBlocksList
} from 'draftjs-utils';

import config from '../../../config';
const {timers} = config;// time constants for the setTimeouts latency consistency


/**
 * Scholar-draft is a custom component wrapping draft-js editors
 * for the purpose of this app.
 * See https://github.com/peritext/scholar-draft
 */
import Editor, {
  utils,
  constants
} from 'scholar-draft';

const {
  INLINE_ASSET,
  NOTE_POINTER,
  SCHOLAR_DRAFT_CLIPBOARD_CODE
} = constants;

const {
  deleteNoteFromEditor,
  getUsedAssets,
  updateNotesFromEditor,
  insertNoteInEditor,
  insertFragment,
} = utils;

import style from 'raw-loader!./assets/apa.csl';
import locale from 'raw-loader!./assets/english-locale.xml';

import BlockContextualizationContainer from './BlockContextualizationContainer';

import ResourceSearchWidget from '../ResourceSearchWidget/ResourceSearchWidget';
import InlineCitation from '../InlineCitation/InlineCitation';
import GlossaryMention from '../GlossaryMention/GlossaryMention';

import Bibliography from './Bibliography';


/**
 * We have to provide scholar-draft the components
 * we want to use to display the assets in the editor.
 * For inline assets we have a component for each asset type
 */
const inlineAssetComponents = {
  bib: InlineCitation,
  glossary: GlossaryMention
};


/**
 * For block assets for now a wrapping component is used
 * that chooses the proper contextualization component
 * one level lower
 */
const blockAssetComponents = {
  'video': BlockContextualizationContainer,
  'image': BlockContextualizationContainer,
  'embed': BlockContextualizationContainer,
  'data-presentation': BlockContextualizationContainer,
  'table': BlockContextualizationContainer,
};

import {translateNameSpacer} from '../../helpers/translateUtils';

import './SectionEditor.scss';


/**
 * SectionEditor class for building react component instances
 */
class SectionEditor extends Component {


  /**
   * Component's context used properties
   */
  static contextTypes = {

    /**
     * Un-namespaced translate function
     */
    t: PropTypes.func.isRequired,
  }


  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
    this.state = {
      hydrated: false
    };
    // this.updateSectionRawContent = this.updateSectionRawContent.bind(this);
    this.updateSectionRawContent = debounce(this.updateSectionRawContent, 2000);
    this.debouncedCleanStuffFromEditorInspection = debounce(this.cleanStuffFromEditorInspection, 500);
    // this.debouncedCleanStuffFromEditorInspection = this.cleanStuffFromEditorInspection.bind(this);
  }


  /**
   * Provides children new context data each time props or state has changed
   */
  getChildContext = () => ({
    startExistingResourceConfiguration: this.props.startExistingResourceConfiguration,
  })


  /**
   * Executes code just after component mounted
   */
  componentDidMount() {
    const {
      sectionId,
      activeSection
    } = this.props;
    if (sectionId && activeSection.contents && Object.keys(activeSection.contents).length) {
      this.hydrateEditorStates(activeSection);
    }
    document.addEventListener('copy', this.onCopy);
    document.addEventListener('cut', this.onCopy);
    document.addEventListener('paste', this.onPaste);
  }


  /**
   * Executes code when component receives new properties
   * @param {object} nextProps - the future properties of the component
   */
  componentWillReceiveProps(nextProps) {
    if (this.props.sectionId !== nextProps.sectionId) {
      const {
        activeSection
      } = nextProps;
      this.hydrateEditorStates(activeSection);
    }
  }

  // componentWillUpdate() {
  //   // benchmarking component performance
  //   console.time('editor update time');
  // }


  /**
   * Executes code after component re-rendered
   */
  componentDidUpdate = (prevProps) => {
    if (this.props.editorStates[this.props.activeSection.id] !== prevProps.editorStates[this.props.activeSection.id]) {
      this.debouncedCleanStuffFromEditorInspection(this.props.activeSection.id);
    }
    // console.timeEnd('editor update time');
  }


  /**
   * Executes code before component unmounts
   */
  componentWillUnmount = () => {
    // remove all document-level event listeners
    // handled by the component
    document.removeEventListener('copy', this.onCopy);
    document.removeEventListener('cut', this.onCopy);
    document.removeEventListener('paste', this.onPaste);
  }


  /**
   * Prepares data within component's state for later pasting
   * @param {event} e - the copy event
   */
  onCopy = e => {
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
    } = this.props;
    const {
      contextualizations,
      contextualizers,
      // resources
    } = activeStory;

    // first step is to retrieve draft-made clipboard ImmutableRecord
    // and proper editor state (wether copy event comes from a note or the main content)
    // case 1: data is copied from the main editor
    if (editorFocus === 'main') {
      clipboard = this.editor.mainEditor.editor.getClipboard();
      editorState = editorStates[activeSection.id];
    // case 2: data is copied from a note
    }
    else {
      editorState = editorStates[editorFocus];
      clipboard = this.editor.notes[editorFocus].editor.editor.getClipboard();
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

    e.clipboardData.setData('text/plain', SCHOLAR_DRAFT_CLIPBOARD_CODE);
    stateDiff.copiedData = copiedData;
    this.setState(stateDiff);/* eslint react/no-set-state:0 */
    e.preventDefault();
  }


  /**
   * Handles pasting command in the editor
   * @param {event} e - the copy event
   */
  onPaste = e => {

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
    } = this.props;

    const {
      notes
    } = activeSection;

    const activeSectionId = activeSection.id;

    const {
      clipboard, // blockMap of the data copied to clipboard
      copiedData, // model-dependent set of data objects saved to clipboard
    } = this.state;

    // this hack allows to check if data comes from outside of the editor
    // case 1 : comes from outside
    if (!clipboard || e.clipboardData.getData('text/plain') !== SCHOLAR_DRAFT_CLIPBOARD_CODE) {
      // clear components "internal clipboard" and let the event happen
      // normally (it is in this case draft-js which will handle the paste process)
      // as a editorChange event (will handle clipboard content as text or html)
      this.setState({/* eslint react/no-set-state:0 */
        clipboard: null,
        copiedData: null
      });
      return;
    }
    else {
      // if contents comes from scholar-draft, prevent default
      // because we are going to handle the paste process manually
      e.preventDefault();
    }

    // let editorState;
    let newNotes;
    let newClipboard = clipboard;// clipboard entities will have to be updated

    // // defining the relevant editor state to work with
    // if (editorFocus === 'main') {
    //   editorState = editorStates[activeSectionId];
    // }
    // else {
    //   editorState = editorStates[editorFocus];
    // }

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
                editorState: EditorState.createWithContent(convertFromRaw(notes[noteId].editorState), this.editor.mainEditor.createDecorator()),
              }
            };
          }, {});
          // now we attribute to new notes a new id (to handle possible duplicates)
          // and merge them with the past notes
          newNotes = data.copiedNotes.reduce((result, note) => {
            const id = generateId();
            // console.log('attributing new node id', id);
            const noteEditorState = EditorState.createWithContent(convertFromRaw(note.rawContent), this.editor.mainEditor.createDecorator());
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
                const editor = editorStates[activeSectionId];
                newContentState = editor.getCurrentContent();
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
                const editor = newNotes[contentId].editorState;

                newContentState = editor.getCurrentContent();
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

    // case pasting target is the main editor
    if (editorFocus === 'main') {
      mainEditorState = insertFragment(mainEditorState, newClipboard);
      newNotes = updateNotesFromEditor(mainEditorState, newNotes);
    }
    // case pasting target is a note editor
    else {
      newNotes = {
        ...newNotes,
        [editorFocus]: {
          ...newNotes[editorFocus],
          editorState: insertFragment(
            EditorState.createWithContent(
              convertFromRaw(newNotes[editorFocus].editorState),
              this.editor.mainEditor.createDecorator()
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
  }


  /**
   * Monitors operations that look into the editor state
   * to see if contextualizations and notes have to be updated/delete
   * (this operation is very expensive in performance and should
   * always be wrapped in a debounce)
   */
  cleanStuffFromEditorInspection = () => {
    this.updateContextualizationsFromEditor(this.props);
    this.updateNotesFromEditor(this.props);
  }


  /**
   * Deletes contextualizations that are not any more linked
   * to an entity in the editor.
   * @param {object} props - properties to use
   */
  updateContextualizationsFromEditor = props => {
    const {
      activeSection,
      editorStates,
      deleteContextualization,
      // sectionId,
      activeStoryId,
      story
    } = props;
    const activeSectionId = activeSection.id;
    // regroup all eligible editorStates
    const notesEditorStates = Object.keys(activeSection.notes).reduce((result, noteId) => {
      return {
        ...result,
        [noteId]: editorStates[noteId]
      };
    }, {});
    // regroup all eligible contextualizations
    const sectionContextualizations = Object.keys(story.contextualizations)
      .filter(id => {
        return story.contextualizations[id].sectionId === activeSectionId;
      })
      .reduce((final, id) => ({
        ...final,
        [id]: story.contextualizations[id],
      }), {});

    // look for used contextualizations in main
    let used = getUsedAssets(editorStates[activeSectionId], sectionContextualizations);
    // look for used contextualizations in notes
    Object.keys(notesEditorStates)
    .forEach(noteId => {
      const noteEditor = notesEditorStates[noteId];
      used = used.concat(getUsedAssets(noteEditor, sectionContextualizations));
    });
    // compare list of contextualizations with list of used contextualizations
    // to track all unused contextualizations
    const unusedAssets = Object.keys(sectionContextualizations).filter(id => used.indexOf(id) === -1);
    // delete contextualizations
    unusedAssets.forEach(id => {
      deleteContextualization(activeStoryId, id);
    });
  }

  /**
   * Deletes notes that are not any more linked
   * to an entity in the editor
   * and update notes numbers if their order has changed.
   * @param {object} props - properties to use
   */
  updateNotesFromEditor = (props) => {
    const {
      editorStates,
      sectionId,
      activeStoryId,
      activeSection,
      updateSection,
    } = props;
    const newNotes = updateNotesFromEditor(editorStates[sectionId], activeSection.notes);
    const newSection = activeSection;
    newSection.notes = newNotes;
    if (newNotes !== activeSection.notes) {
      updateSection(activeStoryId, sectionId, newSection);
    }
  }

  deleteNote = id => {
    const {
      editorStates,
      activeSection,
      sectionId,
      activeStoryId,

      updateSection,
      updateDraftEditorState,
      setEditorFocus,
    } = this.props;
    const mainEditorState = editorStates[sectionId];
    // remove related entity in main editor
    deleteNoteFromEditor(mainEditorState, id, newEditorState => {
      // remove note
      const notes = activeSection.notes;
      delete notes[id];
      // update section
      updateSection(activeStoryId, sectionId, {
        ...activeSection,
        contents: convertToRaw(newEditorState.getCurrentContent()),
        notes
      });
      // update editor
      updateDraftEditorState(sectionId, newEditorState);
      updateDraftEditorState(id, undefined);
      // focus on main editor
      setEditorFocus(sectionId);
    });
    this.editor.focus('main');
  }


  /**
   * Adds an empty note to the editor state
   */
  addNote = () => {
    const {
      editorStates,
      activeStoryId,
      activeSection,
      sectionId,
    } = this.props;

    const id = generateId();
    // add related entity in main editor
    const mainEditorState = insertNoteInEditor(editorStates[sectionId], id);
    // prepare notes with immutable editorState
    const activeNotes = Object.keys(activeSection.notes).reduce((fNotes, nd) => ({
      ...fNotes,
      [nd]: {
        ...activeSection.notes[nd],
        editorState: EditorState.createWithContent(
            convertFromRaw(activeSection.notes[nd].editorState),
            this.editor.mainEditor.createDecorator()
          )
      }
    }), {});
    // add note
    let notes = {
      ...activeNotes,
      [id]: {
        id,
        editorState: this.editor.generateEmptyEditor()
      }
    };
    notes = updateNotesFromEditor(mainEditorState, notes);
    const newSection = {
      ...activeSection,
      contents: convertToRaw(mainEditorState.getCurrentContent()),
      notes: Object.keys(notes).reduce((fNotes, nd) => ({
        ...fNotes,
        [nd]: {
          ...notes[nd],
          editorState: notes[nd].editorState ? convertToRaw(notes[nd].editorState.getCurrentContent()) : this.editor.generateEmptyEditor()
        }
      }), {})
    };
    const newEditors = Object.keys(notes).reduce((fEditors, nd) => ({
      ...fEditors,
      [nd]: notes[nd].editorState
    }), {
      [sectionId]: mainEditorState
    });
    // update contents
    this.props.updateSection(activeStoryId, sectionId, newSection);
    // update editors
    this.props.updateDraftEditorsStates(newEditors);
    // update focus
    // focus on new note
    this.props.setEditorFocus(undefined);
    setTimeout(() => {
      this.props.setEditorFocus(id);
      this.editor.focus(id);
    });
  }


  /**
   * Add plain text in one of the editor states (main or note)
   * @param {string} text - text to add
   * @param {string} contentId - 'main' or noteId
   */
  addTextAtCurrentSelection = (text, contentId) => {
    const {
      activeSection,
      activeStoryId,
      sectionId,
      editorStates,
      updateDraftEditorState,
      updateSection,
    } = this.props;
    const editorState = contentId === 'main' ? editorStates[sectionId] : editorStates[contentId];
    const editorStateId = contentId === 'main' ? sectionId : contentId;
    const newContentState = Modifier.insertText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      text,
    );
    let newSection;
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'insert-text'
    );
    updateDraftEditorState(editorStateId, newEditorState);
    if (contentId === 'main') {
      newSection = {
        ...activeSection,
        contents: convertToRaw(newEditorState.getCurrentContent())
      };
    }
    else {
      newSection = {
        ...activeSection,
        notes: {
          ...activeSection.notes,
          [contentId]: {
            ...activeSection.notes[contentId],
            editorState: convertToRaw(newEditorState.getCurrentContent())
          }
        }
      };
    }
    updateSection(activeStoryId, sectionId, newSection);
  }


  /**
   * Handle changes on contextualizers or resources
   * from within the editor
   * @param {string} dataType - the type of collection where the object to update is located
   * @param {string} dataId - the id of the object
   * @param {object} data - the new data to apply to the object
   */
  onDataChange = (dataType, dataId, data) => {
    const {
      updateResource,
      updateContextualizer,
      activeStoryId
    } = this.props;
    if (dataType === 'resource') {
      updateResource(activeStoryId, dataId, data);
    }
    else if (dataType === 'contextualizer') {
      updateContextualizer(activeStoryId, dataId, data);
    }
  }


  /**
   * Callbacks when an asset is requested
   * @param {string} contentId - the id of the target editor ('main' or noteId)
   * @param {ImmutableRecord} inputSelection - the selection to request the asset at
   */
  onAssetRequest = (contentId, inputSelection) => {
    const {
      setEditorFocus,
      requestAsset,
      editorStates,
      // editorFocus,
    } = this.props;

    const editorId = contentId === 'main' ? this.props.sectionId : contentId;
    const selection = inputSelection || editorStates[editorId].getSelection();

    setEditorFocus(contentId);
    this.editor.focus(contentId);
    // register assetRequestState
    requestAsset(editorId, selection);
  }

  hydrateEditorStates = (activeSection) => {
    const editors = Object.keys(activeSection.notes || {})
        // notes' editor states hydratation
        .reduce((eds, noteId) => ({
          ...eds,
          [noteId]: activeSection.notes[noteId].editorState && activeSection.notes[noteId].editorState.entityMap ?
          EditorState.createWithContent(
            convertFromRaw(activeSection.notes[noteId].editorState),
            this.editor.mainEditor.createDecorator()
          )
          : this.editor.generateEmptyEditor()
        }),
        // main editor state hydratation
        {
          [activeSection.id]: activeSection.contents && activeSection.contents.entityMap ?
            EditorState.createWithContent(
              convertFromRaw(activeSection.contents),
              this.editor.mainEditor.createDecorator()
            )
            : this.editor.generateEmptyEditor()
        });
    this.props.updateDraftEditorsStates(editors);
  }

  updateSectionRawContent = (editorStateId, storyId, sectionId) => {
    // const rawContent = convertToRaw(editorState.getCurrentContent());
    const section = this.props.story.sections[sectionId];

    const finalEditorStateId = editorStateId === 'main' ? sectionId : editorStateId;
    const rawContent = convertToRaw(this.props.editorStates[finalEditorStateId].getCurrentContent());


    let newSection;
    // this.props.update(this.state.editorState);
    if (editorStateId === 'main') {
      newSection = {
        ...section,
        contents: rawContent
      };
    }
    else {
      newSection = {
        ...section,
        notes: {
          ...section.notes,
          [editorStateId]: {
            ...section.notes[editorStateId],
            editorState: rawContent
          }
        }
      };
    }

    this.props.updateSection(storyId, sectionId, newSection);
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const {
      addNote,
      deleteNote,
      updateSectionRawContent,
      onAssetRequest,
      addTextAtCurrentSelection,
      onDataChange,
      state,
      props
    } = this;
    const {
      story,
      activeSection,
      sectionId,
      activeStoryId,
      updateSection,
      editorStates,
      editorFocus,
      setEditorFocus,
      updateDraftEditorState,
      assetRequestPosition,
      cancelAssetRequest,
      summonAsset,
    } = props;

    const {
      clipboard
    } = state;

    if (!story || !activeSection) {
      return null;
    }

    const {
      contextualizers,
      contextualizations,
      resources,
    } = story;


    const {
      notes: inputNotes
    } = activeSection;

    const translate = translateNameSpacer(this.context.t, 'Components.Footer');
    const mainEditorState = editorStates[sectionId]; // || this.editor.generateEmptyEditor();
    // replacing notes with dynamic non-serializable editor states
    const notes = inputNotes ? Object.keys(inputNotes).reduce((no, id) => ({
      ...no,
      [id]: {
        ...inputNotes[id],
        editorState: editorStates[id]
      }
    }), {}) : {};

    // let clipboard;
    const focusedEditorId = editorFocus;


    /**
     * Callbacks
     */
    // the following callbacks are not used for now but available
    // const onAssetClick = () => console.log('on asset click');
    // const onAssetMouseOver = () => console.log('onAssetMouseOver');
    // const onAssetMouseOut = () => console.log('onAssetMouseOut');

    // const onNotePointerMouseOver = () => console.log('onNotePointerMouseOver');
    // const onNotePointerMouseOut = () => console.log('onNotePointerMouseOut');
    // const onNotePointerMouseClick = () => console.log('onNotePointerMouseClick');

    // used callbacks
    const onAssetChoice = (option, contentId) => {
      const {id} = option.metadata;
      let targetedEditorId = contentId;
      if (!targetedEditorId) {
        targetedEditorId = this.props.editorFocus;
      }
      cancelAssetRequest();
      summonAsset(targetedEditorId, id);
      setTimeout(() => {
        setEditorFocus(targetedEditorId);
        this.editor.focus(targetedEditorId);
      }, timers.short);
    };

    const onEditorChange = (editorId, editor) => {
      const editorStateId = editorId === 'main' ? sectionId : editorId;
      // update active immutable editor state
      updateDraftEditorState(editorStateId, editor);
      // ("debouncily") update serialized content
      updateSectionRawContent(editorId, activeStoryId, sectionId);
    };

    const onActiveSectionTitleChange = e => {
      const title = e.target.value;
      e.stopPropagation();
      e.preventDefault();
      const newActiveSection = {
        ...activeSection,
        metadata: {
          ...activeSection.metadata,
          title
        }
      };
      updateSection(activeStoryId, sectionId, newActiveSection);
    };

    const onDrop = (contentId, payload, selection) => {
      if (payload && payload.indexOf('DRAFTJS_RESOURCE_ID:') > -1) {
        const id = payload.split('DRAFTJS_RESOURCE_ID:')[1];
        let targetedEditorId = contentId;
        if (!targetedEditorId) {
          targetedEditorId = this.props.editorFocus;
        }
        const editorId = contentId === 'main' ? activeSection.id : contentId;
        const editorState = editorStates[editorId];
        updateDraftEditorState(editorId, EditorState.forceSelection(editorState, selection));
        onAssetChoice({metadata: {id}}, contentId);
      }
    };

    const onDragOver = (contentId) => {
      if (focusedEditorId !== contentId) {
        setEditorFocus(contentId);
        this.editor.focus(contentId);
      }
    };
    const onClick = (event, contentId = 'main') => {
      if (focusedEditorId !== contentId) {
        setEditorFocus(contentId);
      }
    };

    const onBlur = (event, contentId = 'main') => {
      event.stopPropagation();
      // if focus has not be retaken by another editor
      // after a timeout, blur the whole editor
      // "- be my guest ! - no, you first ! - thank you madame."
      setTimeout(() => {
        if (focusedEditorId === contentId && !assetRequestPosition) {
          setEditorFocus(undefined);
        }
      });
    };

    const onScroll = () => {
      if (focusedEditorId === 'main') {
        this.editor.mainEditor.updateSelection();
      }
      else if (focusedEditorId && this.editor.notes[focusedEditorId]) {
        this.editor.notes[focusedEditorId].editor.updateSelection();
      }
    };
    const onTitleInputClick = e => {
      e.stopPropagation();
    };

    const onAssetRequestCancel = () => {
      setEditorFocus(focusedEditorId);
      setTimeout(() => this.editor.focus(focusedEditorId));
      cancelAssetRequest();
    };

    /*
     * Assets preparation
     */
    const assets = Object.keys(contextualizations)
    .reduce((ass, id) => {
      const contextualization = contextualizations[id];
      const contextualizer = contextualizers[contextualization.contextualizerId];
      return {
        ...ass,
        [id]: {
          ...contextualization,
          resource: resources[contextualization.resourceId],
          contextualizer,
          type: contextualizer ? contextualizer.type : INLINE_ASSET
        }
      };
    }, {});
    /*
     * Citations preparation
     */
    // isolate bib contextualizations
    const bibContextualizations = Object.keys(assets)
    .filter(assetKey =>
        assets[assetKey].type === 'bib'
        && assets[assetKey].sectionId === activeSection.id
      )
    .map(assetKey => assets[assetKey]);
    // build citations items data
    const citationItems = Object.keys(bibContextualizations)
      .reduce((finalCitations, key1) => {
        const bibCit = bibContextualizations[key1];
        const citations = bibCit.resource.data;
        const newCitations = citations.reduce((final2, citation) => {
          return {
            ...final2,
            [citation.id]: citation
          };
        }, {});
        return {
          ...finalCitations,
          ...newCitations,
        };
      }, {});
    // build citations's citations data
    const citationInstances = bibContextualizations // Object.keys(bibContextualizations)
      .map((bibCit, index) => {
        const key1 = bibCit.id;
        const contextualization = contextualizations[key1];

        const contextualizer = contextualizers[contextualization.contextualizerId];
        const resource = resources[contextualization.resourceId];
        return {
          citationID: key1,
          citationItems: resource.data.map(ref => ({
            locator: contextualizer.locator,
            prefix: contextualizer.prefix,
            suffix: contextualizer.suffix,
            // ...contextualizer,
            id: ref.id,
          })),
          properties: {
            noteIndex: index + 1
          }
        };
      });
    // map them to the clumsy formatting needed by citeProc
    // todo: refactor the citationInstances --> citeProc-formatted data as a util
    const citationData = citationInstances.map((instance, index) => [
      instance,
      // citations before
      citationInstances.slice(0, (index === 0 ? 0 : index))
        .map((oCitation) => [
            oCitation.citationID,
            oCitation.properties.noteIndex
          ]
        ),
      []
      // citations after (not using it seems to work anyway)
      // citationInstances.slice(index)
      //   .map((oCitation) => [
      //       oCitation.citationID,
      //       oCitation.properties.noteIndex
      //     ]
      //   ),
    ]);


    const assetChoiceProps = {
      options: Object.keys(resources).map(key => resources[key]),
      addPlainText: (text, contentId) => {
        addTextAtCurrentSelection(text, contentId);
        onAssetRequestCancel();
        setTimeout(() => {
          setEditorFocus(contentId);
        });
      }
    };

    const onSectionTitleClick = () => {
      // because of editor's focus management,
      // focus has to be forced
      setTimeout(() => this.sectionTitle.focus());
    };

    /*
     * References binding
     */
    const bindRef = editor => {
      this.editor = editor;
    };
    const bindSectionTitle = sectionTitle => {
      this.sectionTitle = sectionTitle;
    };
    return (
      <div className="fonio-SectionEditor">
        <h1 className="editable-title" onClick={onTitleInputClick}>
          <input
            type="text"
            ref={bindSectionTitle}
            onClick={onSectionTitleClick}
            value={activeSection.metadata.title || ''}
            onChange={onActiveSectionTitleChange}
            placeholder={translate('section-title')} />
        </h1>
        <div className="editor-wrapper" onScroll={onScroll}>
          <ReferencesManager
            style={style}
            locale={locale}
            items={citationItems}
            citations={citationData}>
            <Editor
              mainEditorState={mainEditorState}
              notes={notes}
              assets={assets}

              clipboard={clipboard}

              ref={bindRef}

              focusedEditorId={focusedEditorId}

              onEditorChange={onEditorChange}

              onDrop={onDrop}
              onDragOver={onDragOver}
              onClick={onClick}
              onBlur={onBlur}

              onAssetRequest={onAssetRequest}
              onAssetChange={onDataChange}
              onAssetRequestCancel={onAssetRequestCancel}
              onAssetChoice={onAssetChoice}

              onNoteAdd={addNote}
              onNoteDelete={deleteNote}

              assetRequestPosition={assetRequestPosition}
              assetChoiceProps={assetChoiceProps}

              inlineAssetComponents={inlineAssetComponents}
              blockAssetComponents={blockAssetComponents}
              AssetChoiceComponent={ResourceSearchWidget} />

            {Object.keys(citationItems).length > 0 ? <Bibliography /> : null}
          </ReferencesManager>
        </div>
      </div>
    );
  }
}

/**
 * Component's properties types
 */
SectionEditor.propTypes = {

  /**
   * active story (needed to access resources and contextualizers
   * which are at story's level)
   */
  story: PropTypes.object,

  /**
   * active story being edited
   */
  activeStoryId: PropTypes.string,

  /**
   * active section data
   */
  activeSection: PropTypes.object,

  /**
   * active section being edited
   */
  sectionId: PropTypes.string,

  /**
   * map of all available draft-js editor states
   */
  editorStates: PropTypes.object,

  /**
   * represents the position of current asset request
   */
  assetRequestPosition: PropTypes.object,

  /**
   * represents the current editor focused in the editor ('main' or noteId)
   */
  editorFocus: PropTypes.string,

  /**
   * callbacks when a whole section is asked to be updated
   */
  updateSection: PropTypes.func,

  /**
   * callbacks when focus on a specific editor among main
   * and notes' editors is asked
   */
  setEditorFocus: PropTypes.func,

  /**
   * callbacks when a draft editor has to be updated
   */
  updateDraftEditorState: PropTypes.func,

  /**
   * callbacks when asset request state is cancelled
   */
  cancelAssetRequest: PropTypes.func,

  /**
   * callbacks when an asset insertion is asked
   */
  summonAsset: PropTypes.func,
};

SectionEditor.childContextTypes = {
  startExistingResourceConfiguration: PropTypes.func
};

export default SectionEditor;
