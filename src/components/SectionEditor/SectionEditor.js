/**
 * This module provides a wrapper for displaying section editor in fonio editor
 * @module fonio/components/SectionEditor
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {debounce} from 'lodash';

import {v4 as generateId} from 'uuid';

import {
  EditorState,
  Modifier,
  convertToRaw,
  convertFromRaw
} from 'draft-js';


import Editor, {
  utils,
  constants
} from 'scholar-draft';
const {
  INLINE_ASSET
} = constants;

import style from 'raw-loader!./assets/apa.csl';
import locale from 'raw-loader!./assets/english-locale.xml';

const {
  deleteNoteFromEditor,
  getUsedAssets,
  updateNotesFromEditor,
  insertNoteInEditor,
} = utils;

import BlockContextualizationContainer from './BlockContextualizationContainer';

import ResourceSearchWidget from '../ResourceSearchWidget/ResourceSearchWidget';
import InlineCitation from '../InlineCitation/InlineCitation';

import Bibliography from './Bibliography';

const inlineAssetComponents = {
  bib: InlineCitation,
};

const blockAssetComponents = {
  'video': BlockContextualizationContainer,
  'image': BlockContextualizationContainer,
  'embed': BlockContextualizationContainer,
  'data-presentation': BlockContextualizationContainer,
};

import {ReferencesManager} from 'react-citeproc';


import {translateNameSpacer} from '../../helpers/translateUtils';

import './SectionEditor.scss';

class SectionEditor extends Component {
  static contextTypes = {
    t: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    // this.updateContent = debounce(this.updateContent, 100);
    this.debouncedCleanStuffFromEditorInspection = debounce(this.cleanStuffFromEditorInspection, 3000);
  }

  componentDidMount() {
    const {
      sectionId,
      activeSection
    } = this.props;
    if (sectionId && activeSection.contents && Object.keys(activeSection.contents).length) {
      this.hydrateEditorStates(activeSection);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.sectionId !== nextProps.sectionId) {
      const {
        activeSection
      } = nextProps;
      this.hydrateEditorStates(activeSection);
    }
  }

  cleanStuffFromEditorInspection = (sectionId) => {
    this.updateContextualizationsFromEditor(sectionId);
    this.updateNotesFromEditor(sectionId);
  }

  updateContextualizationsFromEditor = sectionId => {
    // debounce-related satefy
    if (this.props.activeSection.id !== sectionId) {
      return;
    }
    const {
      activeSection,
      editorStates,
      deleteContextualization,
      activeStoryId,
      story
    } = this.props;
    const activeSectionId = activeSection.id;
    const notesEditorStates = Object.keys(activeSection.notes).reduce((result, noteId) => {
      return {
        ...result,
        [noteId]: editorStates[noteId]
      };
    }, {});
    const sectionContextualizations = Object.keys(story.contextualizations)
      .filter(id => {
        return story.contextualizations[id].sectionId === activeSectionId;
      })
      .reduce((final, id) => ({
        ...final,
        [id]: story.contextualizations[id],
      }), {});

    // in main
    let used = getUsedAssets(editorStates[activeSectionId], sectionContextualizations);
    // in notes
    Object.keys(notesEditorStates)
    .forEach(noteId => {
      const noteEditor = notesEditorStates[noteId];
      used = used.concat(getUsedAssets(noteEditor, sectionContextualizations));
    });
    const unusedAssets = Object.keys(sectionContextualizations).filter(id => used.indexOf(id) === -1);
    unusedAssets.forEach(id => {
      deleteContextualization(activeStoryId, id);
    });
  }

  updateNotesFromEditor = () => {
    const {
      editorStates,
      sectionId,
      activeStoryId,
      activeSection,
      updateSection,
    } = this.props;
    const newNotes = updateNotesFromEditor(editorStates[sectionId], activeSection.notes);
    if (newNotes !== activeSection.notes) {
      updateSection(activeStoryId, sectionId, {
        ...activeSection,
        notes: newNotes
      });
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
            convertFromRaw(activeSection.notes[nd].editorState)
          )
      }
    }), {});
    // add note
    let notes = {
      ...activeNotes,
      [id]: {
        id,
        editorState: EditorState.createEmpty()
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
          editorState: notes[nd].editorState ? convertToRaw(notes[nd].editorState.getCurrentContent()) : EditorState.createEmpty()
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
    this.props.setEditorFocus(id);
    // focus on new note
    setTimeout(() => {
      this.props.setEditorFocus(id);
      this.editor.focus(id);
    }, 100);
  }

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

  onAssetRequest = (contentId, inputSelection) => {
    const {
      setEditorFocus,
      requestAsset,
      editorStates
    } = this.props;

    const editorId = contentId === 'main' ? this.props.sectionId : contentId;
    const selection = inputSelection || editorStates[editorId].getSelection();
    // undo focus
    setEditorFocus(editorId, undefined);
    // register assetRequestState
    requestAsset(editorId, selection);
  }

  hydrateEditorStates = (activeSection) => {
    const editors = Object.keys(activeSection.notes || {})
        .reduce((eds, noteId) => ({
          ...eds,
          [noteId]: activeSection.notes[noteId].editorState && activeSection.notes[noteId].editorState.entityMap ?
          EditorState.createWithContent(convertFromRaw(activeSection.notes[noteId].editorState))
          : EditorState.createEmpty()
        }), {
          [activeSection.id]: activeSection.contents && activeSection.contents.entityMap ?
            EditorState.createWithContent(convertFromRaw(activeSection.contents))
            : EditorState.createEmpty()
        });
    this.props.updateDraftEditorsStates(editors);
  }

  updateContent = (editorStateId, editorState, section, storyId, sectionId) => {
    const rawContent = convertToRaw(editorState.getCurrentContent());
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
    this.debouncedCleanStuffFromEditorInspection(this.props.activeSection.id);
  }

  render() {
    const {
      addNote,
      deleteNote,
      updateContent,
      onAssetRequest,
      addTextAtCurrentSelection,
      onDataChange,
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
    const mainEditorState = editorStates[sectionId] || EditorState.createEmpty();
    // replacing notes with dynamic non-serializable editor states
    const notes = inputNotes ? Object.keys(inputNotes).reduce((no, id) => ({
      ...no,
      [id]: {
        ...inputNotes[id],
        editorState: editorStates[id]
      }
    }), {}) : {};

    // mock
    let clipboard;
    const focusedEditorId = editorFocus;

    /**
     * Callbacks
     */
    // mock - not used
    // const onAssetClick = () => console.log('on asset click');
    // const onAssetMouseOver = () => console.log('onAssetMouseOver');
    // const onAssetMouseOut = () => console.log('onAssetMouseOut');

    // const onNotePointerMouseOver = () => console.log('onNotePointerMouseOver');
    // const onNotePointerMouseOut = () => console.log('onNotePointerMouseOut');
    // const onNotePointerMouseClick = () => console.log('onNotePointerMouseClick');

    // real callbacks
    const onAssetChoice = (option, contentId) => {
      const {id} = option.metadata;
      // console.log('summoning asset', id, option.metadata);
      summonAsset(contentId, id);
      cancelAssetRequest();
      setTimeout(() => {
        setEditorFocus(contentId);
        this.editor.focus(contentId);
      });
    };
    const onEditorChange = (editorId, editor) => {
      const editorStateId = editorId === 'main' ? sectionId : editorId;
      // update active immutable editor state
      updateDraftEditorState(editorStateId, editor);
      // (debouncily) update serialized content
      updateContent(editorId, editor, activeSection, activeStoryId, sectionId);
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
        const editorId = contentId === 'main' ? activeSection.id : contentId;
        const editorState = editorStates[editorId];
        // todo: handle drop selection bug there
        updateDraftEditorState(editorId, EditorState.forceSelection(editorState, selection));
        onAssetChoice({metadata: {id}}, contentId);
      }
    };

    const onDragOver = (contentId) => {
      // const editorId = contentId === 'main' ? sectionId : contentId;
      if (focusedEditorId !== contentId) {
        setEditorFocus(contentId);
      }
    };
    const onClick = (event, contentId = 'main') => {
      if (focusedEditorId !== contentId) {
        setEditorFocus(contentId);
      }
    };

    const onBlur = (event, contentId = 'main') => {
      event.stopPropagation();
      if (focusedEditorId === contentId) {
        setEditorFocus(undefined);
      }
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
      if (focusedEditorId === 'main') {
        this.editor.mainEditor.updateSelection();
      }
      else if (focusedEditorId && this.editor.notes[focusedEditorId]) {
        this.editor.notes[focusedEditorId].editor.updateSelection();
      }
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
      // citations after
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
    /*let assetRequestPosition;
    if (assetRequest) {
      if (assetRequestContentId === 'main') {
        assetRequestPosition = mainEditorState.getSelection();
      } else if(assetRequestContentId && notes[assetRequestContentId]) {
        assetRequestPosition = notes[assetRequestContentId].editorState.getSelection();
      }
    }*/

    /*
     * References binding
     */
    const bindRef = editor => {
      this.editor = editor;
    };
    return (
      <div className="fonio-section-editor">
        <h1 className="editable-title" onClick={onTitleInputClick}>
          <input
            type="text"
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

export default SectionEditor;
