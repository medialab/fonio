/**
 * This module provides a wrapper for displaying section editor in fonio editor
 * @module fonio/components/SectionEditor
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {debounce} from 'lodash';
import {ReferencesManager} from 'react-citeproc';
import {v4 as generateId} from 'uuid';

import ReactTooltip from 'react-tooltip';

import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  SelectionState,
  Modifier
} from 'draft-js';

import {
  Content,
  // Level,
  Title,
  Button,
  Column,
  HelpPin,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Tag,
} from 'quinoa-design-library/components';

import icons from 'quinoa-design-library/src/themes/millet/icons';

const timers = {
  short: 100
};


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
  // updateContextualizationsFromEditor
} from './editorToStoryUtils';

import {
  handleCopy,
  handlePaste,
} from './clipboardUtils';

import BlockContextualizationContainer from './BlockContextualizationContainer';

import ResourceSearchWidget from './ResourceSearchWidget';
import InlineCitation from './InlineCitation';
import GlossaryMention from './GlossaryMention';
import LinkContextualization from './LinkContextualization';

// import Bibliography from './Bibliography';


import BlockQuoteButton from './buttons/BlockQuoteButton';
import BoldButton from './buttons/BoldButton';
// import CodeBlockButton from './buttons/CodeBlockButton';
import HeaderOneButton from './buttons/HeaderOneButton';
import HeaderTwoButton from './buttons/HeaderTwoButton';
import ItalicButton from './buttons/ItalicButton';
import OrderedListItemButton from './buttons/OrderedListItemButton';
import UnorderedListItemButton from './buttons/UnorderedListItemButton';
import LinkButton from './buttons/LinkButton';
import RemoveFormattingButton from './buttons/RemoveFormattingButton';
import NotePointer from './NotePointer';
import AssetButtonComponent from './AssetButton';
import NoteButtonComponent from './NoteButton';

import IconBtn from '../IconBtn';


/**
 * We have to provide scholar-draft the components
 * we want to use to display the assets in the editor.
 * For inline assets we have a component for each asset type
 */
const inlineAssetComponents = {
  bib: InlineCitation,
  glossary: GlossaryMention,
  webpage: LinkContextualization
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

// const EmbedAssetComponent = ({
//   ...props
// }) => <AssetButtonComponent {...props} icon={icons.asset.black.svg} />;

class EmbedAssetComponent extends Component {
  render = () => {
    const bindRef = el => {
      if (el) {
        this.element = el.element;
      }
    };
    return <AssetButtonComponent ref={bindRef} {...this.props} icon={icons.asset.black.svg} />;
  }
}


class ElementLayout extends Component {

  // static propTypes = {
  //   isSize: PropTypes.number,
  //   isOffset: PropTypes.number,
  //   children: PropTypes.array,
  //   style: PropTypes.string,
  // }
  render = () => {

    const {
      isSize = 12,
      isOffset = 0,
      children,
      className = '',
      style = {}
    } = this.props;
    return (
      <Column
        isSize={isSize}
        isOffset={isOffset}
        className={className}
        style={style}>
        {children}
      </Column>
    );
  }
}


class NoteLayout extends Component {/* eslint react/prefer-stateless-function : 0 */
  static contextTypes = {
    t: PropTypes.func,
  }
  render = () => {
    const {
      children,
      note,
      onHeaderClick,
      onDelete,
      onClickToRetroLink,
      id,
    } = this.props;

    const translate = translateNameSpacer(this.context.t, 'Components.SectionEditor');
    return (
      <div id={id}>
        <Column onClick={onHeaderClick}>
          <StretchedLayoutContainer isDirection="horizontal">
            <StretchedLayoutItem isFlex={1}>
              <Button
                data-tip={translate('Go to note')} isColor={'info'} isRounded
                onClick={onClickToRetroLink}>↑</Button>
            </StretchedLayoutItem>

            <StretchedLayoutItem isFlex={10}>
              <Title isSize={3}>Note {note.order}</Title>
            </StretchedLayoutItem>

            <StretchedLayoutItem>
              <IconBtn
                data-tip={translate('Delete note')}
                isColor={'danger'}
                onClick={onDelete}
                src={icons.remove.white.svg} />
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
        </Column>
        <Column>
          {children}
        </Column>
      </div>
    );
  }
}


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
  constructor(props, context) {
    super(props, context);
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

    this.handleCopy = handleCopy.bind(this);
    this.handlePaste = handlePaste.bind(this);

    this.translate = translateNameSpacer(context.t, 'Components.SectionEditor').bind(this);

    this.assetButtons = Object.keys(inlineAssetComponents).reduce((result, type) => ({
      ...result,
      [type]: ({
              ...theseProps
            }) => <AssetButtonComponent {...theseProps} icon={icons[type].black.svg} />
    }), {});

    // this.debouncedCleanStuffFromEditorInspection = this.cleanStuffFromEditorInspection.bind(this);
  }


  /**
   * Provides children new context data each time props or state has changed
   */
  getChildContext = () => ({
    startExistingResourceConfiguration: this.props.startExistingResourceConfiguration,
    startNewResourceConfiguration: this.props.startNewResourceConfiguration,
    deleteContextualizationFromId: this.props.deleteContextualizationFromId,
    removeFormattingForSelection: this.removeFormattingForSelection,
  })


  /**
   * Executes code just after component mounted
   */
  componentDidMount() {
    const {
      activeSection
    } = this.props;
    const {id: sectionId} = activeSection;
    if (sectionId && activeSection.contents && Object.keys(activeSection.contents).length) {
      this.hydrateEditorStates(activeSection);
      // setTimeout(() => this.clearNotesAndContext());
    }
    else if (sectionId) {
      this.props.updateDraftEditorState(sectionId, this.editor.generateEmptyEditor());
      // TODO: manually set story is saved for now, need to optimized
      this.props.setStoryIsSaved(true);
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
  componentWillReceiveProps = (nextProps) => {
    // changing section
    if (this.props.activeSection.id !== nextProps.activeSection.id) {
      const {
        activeSection
      } = nextProps;
      // this.clearNotesAndContext();

      // hydrate editors with new section
      this.hydrateEditorStates(activeSection);
      setTimeout(() => this.props.setEditorFocus('main'));
    }

    if (this.props.story && nextProps.story &&
        (
          this.props.story.resources !== nextProps.story.resources ||
          this.props.story.contextualizers !== nextProps.story.contextualizers ||
          this.props.story.contextualizations !== nextProps.story.contextualizations ||
          this.props.activeSection.id !== nextProps.activeSection.id
        )
      ) {
      setTimeout(() => {
        this.updateStateFromProps(this.props);
        setTimeout(() => {
          this.updateStateFromProps(this.props);
        }, 500);
      });
    }
  }

  componentWillUpdate() {
    // benchmarking component performance
    // console.time('editor update time');/* eslint no-console: 0 */
  }


  /**
   * Executes code after component re-rendered
   */
  componentDidUpdate = (prevProps) => {
    if (this.props.editorStates[this.props.activeSection.id] !== prevProps.editorStates[this.props.activeSection.id]) {
      this.debouncedCleanStuffFromEditorInspection(this.props.activeSection.id);
    }
    // console.timeEnd('editor update time');/* eslint no-console: 0 */
  }


  /**
   * Executes code before component unmounts
   */
  componentWillUnmount = () => {
    // this.clearNotesAndContext();
    // remove all document-level event listeners
    // handled by the component
    document.removeEventListener('copy', this.onCopy);
    document.removeEventListener('cut', this.onCopy);
    document.removeEventListener('paste', this.onPaste);
    this.updateSectionRawContentDebounced.cancel();
    this.debouncedCleanStuffFromEditorInspection.cancel();
  }

  clearNotesAndContext = () => {
    // delete unused notes
    // const prevSection = this.props.activeSection;
    // if (prevSection) {
    //   const newSection = {
    //     ...prevSection,
    //     notes: prevSection.notesOrder.reduce((res, noteId) => ({
    //       ...res,
    //       [noteId]: prevSection.notes[noteId]
    //     }), {})
    //   };
    //   // delete unused contextualizations
    //   // updateContextualizationsFromEditor(this.props);
    //   this.props.updateSection(newSection);

    //   // update all raw contents
    //   const notesIds = Object.keys(prevSection.notes);
    //   notesIds.forEach(noteId => this.updateSectionRawContent(noteId, this.props.story.id, this.props.activeSection.id));
    //   this.updateSectionRawContent('main', this.props.story.id, this.props.activeSection.id);
    // }
  }

  updateStateFromProps = props => {
    const assets = computeAssets(props);
    const citations = buildCitations(assets, props);

    this.setState({/* eslint react/no-set-state : 0 */
      assets,
      assetChoiceProps: computeAssetChoiceProps(props),
      citations,
    });
  }

  ElementLayoutComponent = ({children}) => <ElementLayout isSize={this.props.editorWidth} isOffset={this.props.editorOffset}>{children}</ElementLayout>


  /**
   * Handles user cmd+c like command (storing stashed contextualizations among other things)
   */
  onCopy = e => {
    this.handleCopy(e);
  }

  /**
   * Handles user cmd+v like command (restoring stashed contextualizations among other things)
   */
  onPaste = e => {
    const COPY_THRESHOLD = 1000;
    if (!this.props.disablePaste) {
      const html = e.clipboardData.getData('text/html');

      if (html.length > COPY_THRESHOLD) {
        this.props.setEditorBlocked(true);
        this.handlePaste(e);
        setTimeout(() => {
          this.props.setEditorBlocked(false);
        }, 100);
      }
      else {
        this.handlePaste(e);
      }

    }
  }


  /**
   * Monitors operations that look into the editor state
   * to see if contextualizations and notes have to be updated/delete
   * (this operation is very expensive in performance and should
   * always be wrapped in a debounce)
   */
  cleanStuffFromEditorInspection = () => {
    updateNotesFromSectionEditor(this.props);
  }

  deleteNote = id => {
    const {
      editorStates,
      activeSection,
      updateSection,
      updateDraftEditorState,
      setEditorFocus,
    } = this.props;
    const {id: sectionId} = activeSection;
    const mainEditorState = editorStates[sectionId];
    // scroll to the position of deletion
    this.editor.scrollToNotePointer(id);
    // remove related entity in main editor
    deleteNoteFromEditor(mainEditorState, id, newEditorState => {
      // remove note
      // const notes = activeSection.notes;
      // delete notes[id]; // commented for keeping it for undo-redo purposes
      // update section
      updateSection({
        ...activeSection,
        contents: convertToRaw(newEditorState.getCurrentContent()),
        notesOrder: activeSection.notesOrder.filter(thatNoteId => thatNoteId !== id)
        // notes
      });
      // update editor
      updateDraftEditorState(sectionId, newEditorState);
      updateDraftEditorState(id, undefined);
      // focus on main editor
      setTimeout(() => setEditorFocus('main'));
    });
    // this.editor.focus('main');
  }


  /**
   * Adds an empty note to the editor state
   */
  addNote = () => {
    const {
      editorStates,
      activeSection,
    } = this.props;

    const {id: sectionId} = activeSection;

    const id = generateId();
    // add related entity in main editor
    const mainEditorState = insertNoteInEditor(editorStates[sectionId], id);
    // prepare notes with immutable editorState
    const activeNotes = Object.keys(activeSection.notes).reduce((fNotes, nd) => ({
      ...fNotes,
      [nd]: {
        ...activeSection.notes[nd]
      }
    }), {});
    // add note
    const notes = {
      ...activeNotes,
      [id]: {
        id,
        editorState: this.editor.generateEmptyEditor(),
        contents: convertToRaw(this.editor.generateEmptyEditor().getCurrentContent())
      }
    };
    const {
      // newNotes,
      notesOrder
    } = updateNotesFromEditor(mainEditorState, notes);
    // notes = newNotes;
    const newSection = {
      ...activeSection,
      notesOrder,
      contents: convertToRaw(mainEditorState.getCurrentContent()),
      notes: Object.keys(notes).reduce((fNotes, nd) => ({
        ...fNotes,
        [nd]: {
          ...notes[nd],
          contents: notes[nd].contents || convertToRaw(this.editor.generateEmptyEditor().getCurrentContent())
        }
      }), {})
    };
    const newEditors = Object.keys(notes).reduce((fEditors, nd) => ({
      ...fEditors,
      [nd]: editorStates[nd] || EditorState.createWithContent(
              convertFromRaw(notes[nd].contents),
              this.editor.mainEditor.createDecorator()
            )
    }), {
      [sectionId]: mainEditorState
    });
    // update contents
    this.props.updateSection(newSection);
    // update editors
    this.props.updateDraftEditorsStates(newEditors);
    // update focus
    // focus on new note
    // this.props.setEditorFocus(id);
    // this.props.setEditorFocus(undefined);
    setTimeout(() => {
      this.props.setEditorFocus(id);
      this.editor.scrollToNote(id);
      // this.editor.focus(id);
    }, 500);
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
      updateContextualizer,
      story: {
        id: storyId,
      },
      userId
    } = this.props;
    if (dataType === 'contextualizer') {
      updateContextualizer({
        storyId,
        userId,
        contextualizerId: data.id,
        contextualizer: data
      });
    }
  }


  /**
   * Callbacks when an asset is requested
   * @param {string} contentId - the id of the target editor ('main' or noteId)
   * @param {ImmutableRecord} inputSelection - the selection to request the asset at
   */
  onAssetRequest = (contentId, inputSelection) => {
    const {
      story,
      setEditorFocus,
      requestAsset,
      editorStates,
      startExistingResourceConfiguration,
      // editorFocus,
    } = this.props;

    const editorId = contentId === 'main' ? this.props.activeSection.id : contentId;
    const selection = inputSelection || editorStates[editorId].getSelection();

    const editedEditorState = editorStates[editorId];
    if (editedEditorState) {
      const thatSelection = editedEditorState.getSelection();
      if (thatSelection.isCollapsed()) {
        const content = editedEditorState.getCurrentContent();
        const selectedBlockKey = thatSelection.getStartKey();
        const selectedBlock = content.getBlockForKey(selectedBlockKey);
        const entityKey = selectedBlock.getEntityAt(thatSelection.getStartOffset());
        if (entityKey) {
          const entityData = content.getEntity(entityKey).getData();
          if (entityData.asset && entityData.asset.id) {
            const contextualization = story.contextualizations[entityData.asset.id];
            const resource = story.resources[contextualization.resourceId];
            return startExistingResourceConfiguration(resource.id);
          }
        }
      }
    }

    setEditorFocus(undefined);
    setTimeout(() => {
      setEditorFocus(contentId);
    });
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
    // TODO: manually set story is saved for now, need to optimized
    this.props.setStoryIsSaved(true);
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

    this.props.updateSection(newSection);
    // checking that component is mounted
    if (this.component) {
      this.setState({
        citations: buildCitations(this.state.assets, this.props)
      });
    }
  }

  removeFormattingForSelection = () => {
    const {editorFocus, editorStates, activeSection} = this.props;
    const {id: sectionId} = activeSection;
    const editorState = editorFocus === 'main' ? editorStates[sectionId] : activeSection.notes[editorFocus].contents;
    // const styles = editorState.getCurrentInlineStyle().toList().toJS();
    const styles = [
      'BOLD',
      'ITALIC',
      'UNDERLINE',
      'STRIKETHROUGH',
      'CODE'
    ];

    let newEditorState = editorState;
    styles.forEach(style => {
      newEditorState = EditorState.push(
        newEditorState,
        Modifier.removeInlineStyle(newEditorState.getCurrentContent(), newEditorState.getSelection(), style),
        'remove-inline-style'
      );
    });

    this.onEditorChange(editorFocus, newEditorState);

  }

  /**
   * Util for Draft.js strategies building
   */
  findWithRegex = (regex, contentBlock, callback) => {
    const text = contentBlock.getText();
    let matchArr;
    let start;
    while ((matchArr = regex.exec(text)) !== null) {
      start = matchArr.index;
      callback(start, start + matchArr[0].length);
    }
  }

  /**
   * Draft.js strategy for finding draft js drop placeholders
   * @param {ImmutableRecord} contentBlock - the content block in which entities are searched
   * @param {function} callback - callback with arguments (startRange, endRange, props to pass)
   * @param {ImmutableRecord} inputContentState - the content state to parse
   */
  findDraftDropPlaceholder = (contentBlock, callback) => {
    const PLACE_HLODER_REGEX = /(DRAFTJS_RESOURCE_ID:[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/gi;
    this.findWithRegex(PLACE_HLODER_REGEX, contentBlock, callback);
  }
  /**
   * Draft.js strategy for finding native links
   * @param {ImmutableRecord} contentBlock - the content block in which entities are searched
   * @param {function} callback - callback with arguments (startRange, endRange, props to pass)
   * @param {ImmutableRecord} inputContentState - the content state to parse
   */
  findLink = (contentBlock, callback, contentState) => {
      let props;
      contentBlock.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          if (
            entityKey !== null &&
            contentState.getEntity(entityKey).getType() === 'LINK'
          ) {
            props = {...contentState.getEntity(entityKey).getData()};
            return true;
          }
        },
        (from, to) => {
          callback(from, to, props);
        }
      );
    }


  inlineButtons = () => [
    <BoldButton tooltip={this.translate('bold text')} key={1} />,
    <ItalicButton tooltip={this.translate('italic text')} key={2} />,
    <BlockQuoteButton tooltip={this.translate('quote')} key={3} />,
    <HeaderOneButton tooltip={this.translate('big title')} key={4} />,
    <HeaderTwoButton tooltip={this.translate('small title')} key={5} />,
    <OrderedListItemButton tooltip={this.translate('ordered list')} key={6} />,
    <UnorderedListItemButton tooltip={this.translate('unordered list')} key={7} />,
    <RemoveFormattingButton tooltip={this.translate('remove formatting for selection')} key={9} />,
    <LinkButton tooltip={this.translate('add a link')} key={8} />,
    /*<CodeBlockButton />,*/
  ]

  onEditorChange = (editorId, editorState) => {
    const {activeSection: {id: sectionId}, story: {id: activeStoryId}, updateDraftEditorState, editorStates, setStoryIsSaved} = this.props;
    const {updateSectionRawContentDebounced} = this;
    const editorStateId = editorId === 'main' ? sectionId : editorId;
    // console.log('on update', editorStateId, convertToRaw(editor.getCurrentContent()));
    // update active immutable editor state
    updateDraftEditorState(editorStateId, editorState);
    const currentEditorState = editorStates[editorStateId];
    if (currentEditorState.getCurrentContent() !== editorState.getCurrentContent()) {
      setStoryIsSaved(false);
      updateSectionRawContentDebounced(editorId, activeStoryId, sectionId);
    }
  };

  handleEditorPaste = (text, html) => {
    if (html) {
      // check whether the clipboard contains fonio data
      const dataRegex = /<script id="fonio-copied-data" type="application\/json">(.*)<\/script>$/gm;
      const hasScript = dataRegex.test(html);
      return hasScript;
    }
    return false;
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render = () => {
    const {
      addNote,
      deleteNote,
      onAssetRequest,
      onDataChange,
      state,
      props,
      onEditorChange,
      handleEditorPaste,
    } = this;
    const {
      story,
      activeSection,
      // updateSection,
      editorStates,
      editorFocus,
      setEditorFocus,
      assetRequestContentId,

      updateDraftEditorState,
      assetRequestPosition,
      cancelAssetRequest,
      summonAsset,
      draggedResourceId,
      // editorWidth,
      // editorOffset,
      style: componentStyle = {},
    } = props;

    const {
      clipboard,
      assets = {},
      assetChoiceProps = {},
      citations
    } = state;

    const {
        citationItems,
        citationData
      } = citations;
    if (!story || !activeSection) {
      return null;
    }

    const {
      notes: inputNotes,
      notesOrder,
      id: sectionId,
    } = activeSection;

    const mainEditorState = editorStates[sectionId]; // || this.editor.generateEmptyEditor();
    // replacing notes with dynamic non-serializable editor states
    const notes = inputNotes ? Object.keys(inputNotes).reduce((no, id) => ({
      ...no,
      [id]: {
        ...inputNotes[id],
        editorState: editorStates[id]
      }
    }), {}) : {};

    let RealAssetComponent = EmbedAssetComponent;

    // let clipboard;
    const focusedEditorId = editorFocus;

    const editorStateId = focusedEditorId === 'main' ? sectionId : focusedEditorId;


    const editedEditorState = editorStates[editorStateId];
    let resourceType;
    if (editedEditorState) {
      const selection = editedEditorState.getSelection();
      if (selection.isCollapsed()) {
        const content = editedEditorState.getCurrentContent();
        const selectedBlockKey = selection.getStartKey();
        const selectedBlock = content.getBlockForKey(selectedBlockKey);
        const entityKey = selectedBlock.getEntityAt(selection.getStartOffset());
        if (entityKey) {
          const entityData = content.getEntity(entityKey).getData();
          if (entityData.asset && entityData.asset.id) {
            const contextualization = story.contextualizations[entityData.asset.id];
            const resource = story.resources[contextualization.resourceId];
            resourceType = resource.metadata.type;
          }
        }
      }
    }
    RealAssetComponent = resourceType ? this.assetButtons[resourceType] : EmbedAssetComponent;


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
      const {id} = option;
      let targetedEditorId = contentId;
      if (!targetedEditorId) {
        targetedEditorId = this.props.editorFocus;
      }
      cancelAssetRequest();
      summonAsset(targetedEditorId, id);
      setEditorFocus(undefined);
      setTimeout(() => {
        setEditorFocus(targetedEditorId);
      }, timers.short);
    };
    const blockAssetTypes = ['image', 'table', 'video', 'embed'];
    const onDrop = (contentId, payload, selection) => {
      if (draggedResourceId) {
        let targetedEditorId = contentId;
        if (!targetedEditorId) {
          targetedEditorId = this.props.editorFocus;
        }
        const editorId = contentId === 'main' ? activeSection.id : contentId;
        const draggedResource = story.resources[draggedResourceId];
        if (contentId !== 'main' && blockAssetTypes.indexOf(draggedResource.metadata.type) !== -1) {
          // set error message when try drag a block asset into note
          this.props.setErrorMessage({type: 'CREATE_CONTEXTUALIZATION_NOTE_FAIL', error: `${draggedResource.metadata.type} could not be added into note`});
        }
        else {
          const editorState = editorStates[editorId];
          // updating selection to take into account the drop payload
          const rightSelectionState = new SelectionState({
            anchorKey: selection.getStartKey(),
            anchorOffset: selection.getStartOffset() - payload.length,
            focusKey: selection.getEndKey(),
            focusOffset: selection.getEndOffset() - payload.length
          });
          updateDraftEditorState(editorId, EditorState.forceSelection(editorState, rightSelectionState));
          onAssetChoice({id: draggedResourceId}, contentId);
        }
      }
    };

    const onDragOver = (contentId) => {
      if (focusedEditorId !== contentId) {
        setEditorFocus(contentId);
      }
    };
    const onClick = (event, contentId = 'main') => {
      if (focusedEditorId !== contentId) {
        if (this.props.assetRequestState) {
          this.props.setAssetRequestContentId(contentId);
        }
        setEditorFocus(contentId);
        // setEditorFocus(undefined);
        // setTimeout(() => setEditorFocus(contentId));
      }
    };

    const onBlur = (event, contentId = 'main') => {
      if (contentId !== 'main') {
        this.updateSectionRawContent(contentId, story.id, activeSection.id);
      }
      event.stopPropagation();
      // if focus has not be retaken by another editor
      // after a timeout, blur the whole editor
      // "- be my guest ! - no, you first ! - thank you madame."
      setTimeout(() => {
        if (focusedEditorId === contentId && !assetRequestPosition) {
          setEditorFocus(undefined);
        }
        if (contentId !== 'main') {
          this.updateSectionRawContent(contentId, this.props.activeStoryId, this.props.activeSection.id);
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

    const onAssetRequestCancel = () => {
      cancelAssetRequest();
      setEditorFocus(undefined);
      setTimeout(() => {
        setEditorFocus(focusedEditorId);
      }, timers.short);
    };

    const onNotePointerMouseClick = (noteId) => {
      setTimeout(() => setEditorFocus(noteId));
    };

    // define citation style and locales, falling back on defaults if needed
    const {style, locale} = getCitationModels(story);

    // additional inline entities to display in the editor
    const additionalInlineEntities = [
      {
        strategy: this.findDraftDropPlaceholder,
        component: ({children}) =>
          (<Tag className="is-rounded" isColor={'dark'}>
            {this.translate('loading')}
            <span style={{display: 'none'}}>{children}</span>
          </Tag>)
      },
      {
        strategy: this.findLink,
        component: ({children, url}) => {
          return (<span className="native-link">
            <span className="link-content">
              <span>{children}</span>
              <span className="pin-container">
                <HelpPin>
                  {this.translate('native link to {u}', {u: url})}
                </HelpPin>
              </span>
            </span>
          </span>);
        }
      }
    ];

    const inlineButtons = this.inlineButtons();

    const bindRef = component => {
      this.component = component;
    };

    return (
      <Content style={componentStyle} className="fonio-SectionEditor">
        <div
          ref={bindRef}
          className="editor-wrapper"
          onScroll={onScroll}>
          <ReferencesManager
            style={style}
            locale={locale}
            items={citationItems}
            citations={citationData}>
            <Editor
              mainEditorState={mainEditorState}
              customContext={citations}
              notes={notes}
              notesOrder={notesOrder}
              assets={assets}

              handlePastedText={handleEditorPaste}

              messages={{
                addNote: this.translate('add-note'),
                summonAsset: this.translate('summon-asset'),
                cancel: this.translate('cancel'),
              }}

              BibliographyComponent={null/*Object.keys(citationItems).length > 0 ? () => <Bibliography /> : null*/}

              clipboard={clipboard}

              ref={editor => {
              this.editor = editor;
              }}

              focusedEditorId={focusedEditorId}

              onEditorChange={onEditorChange}

              editorPlaceholder={this.translate('start writing')}

              onDrop={onDrop}
              onDragOver={onDragOver}
              onClick={onClick}
              onBlur={onBlur}
              inlineButtons={inlineButtons}

              onAssetRequest={onAssetRequest}
              onAssetChange={onDataChange}
              onAssetRequestCancel={onAssetRequestCancel}
              onAssetChoice={onAssetChoice}
              onNotePointerMouseClick={onNotePointerMouseClick}

              onNoteAdd={addNote}
              onNoteDelete={deleteNote}

              assetRequestContentId={assetRequestContentId}

              assetRequestPosition={assetRequestPosition}
              assetChoiceProps={assetChoiceProps}
              NoteLayout={NoteLayout}

              NotePointerComponent={NotePointer}
              AssetButtonComponent={RealAssetComponent}
              NoteButtonComponent={NoteButtonComponent}
              ElementLayoutComponent={this.ElementLayoutComponent}

              inlineAssetComponents={inlineAssetComponents}
              blockAssetComponents={blockAssetComponents}
              AssetChoiceComponent={ResourceSearchWidget}
              inlineEntities={additionalInlineEntities} />
          </ReferencesManager>
        </div>
        <ReactTooltip
          id="style-button"
          place="top"
          effect="solid" />
        <ReactTooltip
          id="icon-btn-tooltip" />
      </Content>
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
   * active section data
   */
  activeSection: PropTypes.object,

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

  setAssetRequestContentId: PropTypes.func,
};

SectionEditor.childContextTypes = {
  startExistingResourceConfiguration: PropTypes.func,
  startNewResourceConfiguration: PropTypes.func,
  deleteContextualizationFromId: PropTypes.func,
  removeFormattingForSelection: PropTypes.func,
};

export default SectionEditor;
