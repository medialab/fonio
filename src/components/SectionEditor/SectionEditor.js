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
  convertToRaw,
  convertFromRaw,
} from 'draft-js';

import config from '../../../config';
const {timers} = config;// time constants for the setTimeouts latency consistency


/**
 * Scholar-draft is a custom component wrapping draft-js editors
 * for the purpose of this app.
 * See https://github.com/peritext/scholar-draft
 */
import Editor, {
  utils,
} from 'scholar-draft';

const {
  deleteNoteFromEditor,
  updateNotesFromEditor,
  insertNoteInEditor,
} = utils;

import {
  computeAssets,
  computeAssetChoiceProps,
} from './utils';

import {
  getCitationModels,
  buildCitations,
} from './citationUtils';

import {
  updateNotesFromSectionEditor,
  updateContextualizationsFromEditor
} from './editorToStoryUtils';

import {
  handleCopy,
  handlePaste,
} from './clipboardUtils';

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
      hydrated: false,
      citations: {
        citationItems: {},
        citationData: []
      }
    };
    // SectionRawContent = this.updateSectionRawContent.bind(this);
    this.updateSectionRawContent = this.updateSectionRawContent.bind(this);
    this.updateSectionRawContentDebounced = debounce(this.updateSectionRawContent, 2000);
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

    this.updateStateFromProps(this.props);
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
      this.updateSectionRawContent('main', this.props.activeStoryId, this.props.sectionId);
      this.hydrateEditorStates(activeSection);
    }

    if (this.props.story && nextProps.story &&
        (
          this.props.story.resources !== nextProps.story.resources ||
          this.props.story.contextualizers !== nextProps.story.contextualizers ||
          this.props.story.contextualizations !== nextProps.story.contextualizations ||
          this.props.sectionId !== nextProps.sectionId
        )
      ) {
      this.updateStateFromProps(nextProps);
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

  updateStateFromProps = props => {
    const assets = computeAssets(props);
    this.setState({/* eslint react/no-set-state : 0 */
      assets,
      assetChoiceProps: computeAssetChoiceProps(props),
      citations: buildCitations(assets, props),
    });
  }


  /**
   * Handles user cmd+c like command (storing stashed contextualizations among other things)
   */
  onCopy = e => {
    const {props, state, setState, editor} = this;
    handleCopy(props, state, setState, editor, e);
  }

  /**
   * Handles user cmd+c like command (restoring stashed contextualizations among other things)
   */
  onPaste = e => {
    const {props, state, setState, editor} = this;
    handlePaste(props, state, setState, editor, e);
  }


  /**
   * Monitors operations that look into the editor state
   * to see if contextualizations and notes have to be updated/delete
   * (this operation is very expensive in performance and should
   * always be wrapped in a debounce)
   */
  cleanStuffFromEditorInspection = () => {
    updateContextualizationsFromEditor(this.props);
    updateNotesFromSectionEditor(this.props);
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
        contents: EditorState.createWithContent(
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
        contents: this.editor.generateEmptyEditor()
      }
    };
    const {newNotes, notesOrder} = updateNotesFromEditor(mainEditorState, notes);
    notes = newNotes;
    const newSection = {
      ...activeSection,
      notesOrder,
      contents: convertToRaw(mainEditorState.getCurrentContent()),
      notes: Object.keys(notes).reduce((fNotes, nd) => ({
        ...fNotes,
        [nd]: {
          ...notes[nd],
          contents: notes[nd].editorState ? convertToRaw(notes[nd].editorState.getCurrentContent()) : this.editor.generateEmptyEditor()
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
          [noteId]: activeSection.notes[noteId].contents && activeSection.notes[noteId].contents.entityMap ?
          EditorState.createWithContent(
            convertFromRaw(activeSection.notes[noteId].contents),
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
    const section = this.props.story.sections[sectionId];

    const finalEditorStateId = editorStateId === 'main' ? sectionId : editorStateId;
    const finalEditorState = this.props.editorStates[finalEditorStateId];
    // as the function is debounced it would be possible
    // not to have access to the final editor state
    if (!finalEditorState) {
      return;
    }
    const rawContent = convertToRaw(finalEditorState.getCurrentContent());

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
            contents: rawContent
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
      updateSectionRawContentDebounced,
      onAssetRequest,
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
      clipboard,
      assets = {},
      assetChoiceProps = {},
      citations: {
        citationItems,
        citationData
      }
    } = state;

    if (!story || !activeSection) {
      return null;
    }

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
        contents: editorStates[id]
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
      updateSectionRawContentDebounced(editorId, activeStoryId, sectionId);
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
        if(contentId !== 'main') {
          this.updateSectionRawContent(contentId, this.props.activeStoryId, this.props.sectionId);
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
      cancelAssetRequest();
      setTimeout(() => {
        setEditorFocus(focusedEditorId);
        this.editor.focus(focusedEditorId);
      }, timers.short);
    };

    const onSectionTitleClick = () => {
      // because of editor's focus management,
      // focus has to be forced
      setTimeout(() => this.sectionTitle.focus());
    };


    // define citation style and locales, falling back on defaults if needed
    const {style, locale} = getCitationModels(story);

    return (
      <div className="fonio-SectionEditor">
        <h1 className="editable-title" onClick={onTitleInputClick}>
          <input
            type="text"
            ref={sectionTitle => {
this.sectionTitle = sectionTitle;
}}
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

              BibliographyComponent={Object.keys(citationItems).length > 0 ? () => <Bibliography /> : null}

              clipboard={clipboard}

              ref={editor => {
              this.editor = editor;
              }}

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
