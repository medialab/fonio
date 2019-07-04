/**
 * This module provides a wrapper for displaying section editor in fonio editor
 * @module fonio/components/SectionEditor
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { v4 as generateId } from 'uuid';
import ReactTooltip from 'react-tooltip';
import { ReferencesManager } from 'react-citeproc';
import {
  EditorState,
  convertToRaw,
  convertFromRaw,
  SelectionState,
  Modifier
} from 'draft-js';

import {
  Content,
  Title,
  Button,
  Image,
  Column,
  HelpPin,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Tag,
} from 'quinoa-design-library/components';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Scholar-draft is a custom component wrapping draft-js editors
 * for the purpose of this app.
 * See https://github.com/peritext/scholar-draft
 */
import Editor, {
  utils,
} from 'scholar-draft';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';
import { abbrevString, silentEvent } from '../../helpers/misc';
import {
  computeAssets,
  computeAssetChoiceProps,
} from '../../helpers/editorUtils';

import {
  getCitationModels,
  buildCitations,
} from '../../helpers/citationUtils';

import {
  updateNotesFromSectionEditor,
  // updateContextualizationsFromEditor
} from '../../helpers/editorToStoryUtils';

import {
  handleCopy,
  handlePaste,
} from '../../helpers/clipboardUtils';

/**
 * Imports Components
 */
import AssetButtonComponent from './AssetButton';
import BlockContextualizationContainer from './BlockContextualizationContainer';
import BlockQuoteButton from './buttons/BlockQuoteButton';
import BoldButton from './buttons/BoldButton';
import GlossaryMention from './GlossaryMention';
import HeaderOneButton from './buttons/HeaderOneButton';
import HeaderTwoButton from './buttons/HeaderTwoButton';
import IconBtn from '../IconBtn';
import InlineCitation from './InlineCitation';
import ItalicButton from './buttons/ItalicButton';
import LinkButton from './buttons/LinkButton';
import GlossaryButton from './buttons/GlossaryButton';
import InternalLinkButton from './buttons/InternalLinkButton';
import LinkContextualization from './LinkContextualization';
import NoteButtonComponent from './NoteButton';
import NotePointer from './NotePointer';
import OrderedListItemButton from './buttons/OrderedListItemButton';
import RemoveFormattingButton from './buttons/RemoveFormattingButton';
import ResourceSearchWidget from './ResourceSearchWidget';
import UnorderedListItemButton from './buttons/UnorderedListItemButton';

/**
 * Imports Assets
 */
import './SectionEditor.scss';

/**
 * Shared variables
 */
const timers = {
  short: 100
};

const UPDATE_RAW_CONTENTS_TIMEOUT = 2000;
const MEDIUM_TIMEOUT = 500;

const {
  deleteNoteFromEditor,
  updateNotesFromEditor,
  insertNoteInEditor,
} = utils;

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

class EmbedAssetComponent extends Component {
  render = () => {
    const bindRef = ( el ) => {
      if ( el ) {
        this.element = el.element;
      }
    };
    return (
      <AssetButtonComponent
        ref={ bindRef }
        { ...this.props }
        icon={ icons.asset.black.svg }
      />
    );
  }
}

class ElementLayout extends Component {

  /*
   * static propTypes = {
   *   isSize: PropTypes.number,
   *   isOffset: PropTypes.number,
   *   children: PropTypes.array,
   *   style: PropTypes.string,
   * }
   */
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
        isSize={ isSize }
        isOffset={ isOffset }
        className={ className }
        style={ style }
      >
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

    const translate = translateNameSpacer( this.context.t, 'Components.SectionEditor' );
    return (
      <div id={ id }>
        <Column onClick={ onHeaderClick }>
          <StretchedLayoutContainer isDirection={ 'horizontal' }>
            <StretchedLayoutItem
              style={ { marginRight: '1rem' } }
              isFlex={ 1 }
            >
              <Button
                data-tip={ translate( 'Go to note' ) }
                isColor={ 'info' }
                isRounded
                onClick={ onClickToRetroLink }
              >↑
              </Button>
            </StretchedLayoutItem>

            <StretchedLayoutItem isFlex={ 10 }>
              <Title isSize={ 3 }>Note {note.order}</Title>
            </StretchedLayoutItem>

            <StretchedLayoutItem>
              <IconBtn
                data-tip={ translate( 'Delete note' ) }
                data-for={ 'note-tooltip' }
                isColor={ 'danger' }
                onClick={ onDelete }
                src={ icons.remove.white.svg }
              />
            </StretchedLayoutItem>
          </StretchedLayoutContainer>
        </Column>
        <Column>
          {children}
        </Column>
        <ReactTooltip id={ 'note-tooltip' } />
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
    getResourceDataUrl: PropTypes.func,

  }

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor( props, context ) {
    super( props, context );
    this.state = {
      hydrated: false,
      citations: {
        citationItems: {},
        citationData: []
      }
    };
    // SectionRawContent = this.updateSectionRawContent.bind(this);
    this.updateSectionRawContent = this.updateSectionRawContent.bind( this );
    this.updateSectionRawContentDebounced = debounce( this.updateSectionRawContent, UPDATE_RAW_CONTENTS_TIMEOUT );
    this.debouncedCleanStuffFromEditorInspection = debounce( this.cleanStuffFromEditorInspection, MEDIUM_TIMEOUT );

    this.handlePaste = handlePaste.bind( this );
    this.handleCopy = handleCopy.bind( this );

    this.translate = translateNameSpacer( context.t, 'Components.SectionEditor' ).bind( this );

    this.assetButtons = Object.keys( inlineAssetComponents ).reduce( ( result, type ) => ( {
      ...result,
      [type]: ( {
              ...theseProps
            } ) => (
              <AssetButtonComponent
                { ...theseProps }
                icon={ icons[type].black.svg }
              />
            )
    } ), {} );

    this.internalLinkButton = ( {
      // ...theseProps
    } ) => {
      const handleClick = ( e ) => {
        this.onEditCursoredInternalLink();
        e.stopPropagation();

      };
      const handleMouseDown = ( e ) => {
        this.onEditCursoredInternalLink();
        e.stopPropagation();
      };
      return (
        <IconBtn
          onMouseDown={ handleMouseDown }
          onClick={ handleClick }
          data-tip={ this.translate( 'edit internal link' ) }
          src={ require( '../../sharedAssets/internal-link.svg' ) }
        />
      );
    };

    // this.debouncedCleanStuffFromEditorInspection = this.cleanStuffFromEditorInspection.bind(this);
  }

  /**
   * Provides children new context data each time props or state has changed
   */
  getChildContext = () => ( {
    startExistingResourceConfiguration: this.props.startExistingResourceConfiguration,
    startNewResourceConfiguration: this.props.startNewResourceConfiguration,
    deleteContextualizationFromId: this.props.deleteContextualizationFromId,
    removeFormattingForSelection: this.removeFormattingForSelection,
    selectedContextualizationId: this.props.selectedContextualizationId,
    setSelectedContextualizationId: this.props.setSelectedContextualizationId,
  } )

  /**
   * Executes code just after component mounted
   */
  componentDidMount() {
    const {
      activeSection
    } = this.props;
    const { id: sectionId } = activeSection;
    if ( sectionId && activeSection.contents && Object.keys( activeSection.contents ).length ) {
      this.hydrateEditorStates( activeSection );
      // setTimeout(() => this.clearNotesAndContext());
    }
    else if ( sectionId ) {
      this.props.updateDraftEditorState( sectionId, this.editor.generateEmptyEditor() );
      // TODO: manually set story is saved for now, need to optimized
      this.props.setStoryIsSaved( true );
    }
    document.addEventListener( 'copy', this.onCopy );
    document.addEventListener( 'cut', this.onCopy );
    document.addEventListener( 'paste', this.onPaste );

    document.addEventListener( 'keyup', this.onKeyUp );

    this.updateStateFromProps( this.props );

    // wrapped in setTimeout to prevent firefox "DOM Not found" bug
    setTimeout( () => {
      this.props.setEditorFocus( 'main' );
    } );
  }

  /**
   * Executes code when component receives new properties
   * @param {object} nextProps - the future properties of the component
   */
  componentWillReceiveProps = ( nextProps ) => {

    // changing section
    if ( this.props.activeSection.id !== nextProps.activeSection.id ) {
      const {
        activeSection
      } = nextProps;
      // this.clearNotesAndContext();

      // hydrate editors with new section
      this.hydrateEditorStates( activeSection );
      setTimeout( () => this.props.setEditorFocus( 'main' ) );
    }

    if ( this.props.story &&
      nextProps.story &&
        (
          this.props.story.resources !== nextProps.story.resources ||
          this.props.story.contextualizers !== nextProps.story.contextualizers ||
          this.props.story.contextualizations !== nextProps.story.contextualizations ||
          this.props.activeSection.id !== nextProps.activeSection.id ||
          this.props.selectedContextualizationId !== nextProps.selectedContextualizationId
        )
      ) {
      setTimeout( () => {
        this.updateStateFromProps( this.props );

        /**
         * @todo ouuuu ugly
         */
        setTimeout( () => {
          this.updateStateFromProps( this.props );
        }, MEDIUM_TIMEOUT );
      } );
    }
  }

  componentWillUpdate() {
    // benchmarking component performance
    // console.time('editor update time');/* eslint no-console: 0 */
  }

  /**
   * Executes code after component re-rendered
   */
  componentDidUpdate = ( prevProps ) => {
    if ( this.props.editorStates[this.props.activeSection.id] !== prevProps.editorStates[this.props.activeSection.id] ) {
      this.debouncedCleanStuffFromEditorInspection( this.props.activeSection.id );
      this.updateLinkPopupData();
    }
    // console.timeEnd('editor update time');/* eslint no-console: 0 */
  }

  /**
   * Executes code before component unmounts
   */
  componentWillUnmount = () => {

    /*
     * this.clearNotesAndContext();
     * remove all document-level event listeners
     * handled by the component
     */
    document.removeEventListener( 'copy', this.onCopy );
    document.removeEventListener( 'cut', this.onCopy );
    document.removeEventListener( 'paste', this.onPaste );
    document.removeEventListener( 'keyup', this.onKeyUp );

    this.updateSectionRawContentDebounced.flush();
    this.debouncedCleanStuffFromEditorInspection.flush();
  }

  componentDidCatch( error, info ) {
    console.log( error, info );/* eslint no-console: 0 */
  }

  onEditCursoredInternalLink = () => {
    const focus = this.props.editorFocus;
    const editorFocus = focus === 'main' ? this.props.activeSection.id : this.props.editorFocus;
    if ( this.props.editorStates[editorFocus] ) {
      const editorState = this.props.editorStates[editorFocus];
      const entitySelected = this.getEntityAtSelection( editorState );
      if ( entitySelected ) {
        const { entity: entityAtSelection, entityKey } = entitySelected;
        if ( entityAtSelection.getType() === 'SECTION_POINTER' ) {
          // get selection for that entity
          let entity;
          const content = editorState.getCurrentContent();
          content
          .getBlocksAsArray().forEach( ( block ) => {
              let selectedEntity = null;
              block.findEntityRanges(
                ( character ) => {
                  if ( character.getEntity() !== null ) {
                    const key = character.getEntity();
                    const thatEntity = content.getEntity( key );
                    if ( key === entityKey ) {
                      selectedEntity = {
                        entityKey: character.getEntity(),
                        blockKey: block.getKey(),
                        entity: content.getEntity( character.getEntity() ),
                        data: thatEntity.getData(),
                      };
                      return true;
                    }
                  }
                  return false;
                },
                ( start, end ) => {
                  entity = { ...selectedEntity, start, end };
                } );
          // select content for that entity
          if ( entity ) {
            const newSelection = editorState.getSelection().merge( {
                anchorOffset: entity.start,
                focusOffset: entity.end,
            } );

            /*
             * const newEditorState = EditorState.acceptSelection(editorState, newSelection);
             * this.props.updateDraftEditorState(editorFocus, newEditorState);
             * this.props.editorFocus(undefined);
             * setTimeout(() => this.props.setEditorFocus(focus));
             */
            this.props.setInternalLinkModalFocusData( { focusId: focus, selection: newSelection, selectedSectionId: entity.data.sectionId } );
          }
          // open modal
        } );
      }
    }
  }
}

  updateLinkPopupData = () => {
    const editorFocus = this.props.editorFocus === 'main' ? this.props.activeSection.id : this.props.editorFocus;
    if ( this.props.editorStates[editorFocus] ) {
      const entitySelected = this.getEntityAtSelection( this.props.editorStates[editorFocus] );
      if ( entitySelected ) {
        const { entity: entityAtSelection } = entitySelected;
        const data = entityAtSelection.getData();
        if ( data && data.asset ) {
          const contextualizationId = data.asset.id;
          const contextualization = this.props.story.contextualizations[contextualizationId];
          const resource = this.props.story.resources[contextualization.resourceId];
          if ( resource.metadata.type === 'webpage' ) {
            try {
              const selection = window.getSelection();
              const selectionPosition = selection.getRangeAt( 0 ).getBoundingClientRect();
              const componentPosition = this.component.getBoundingClientRect();
              if ( selectionPosition ) {
                return this.setState( {
                  linkPopupData: {
                    x: selectionPosition.x - componentPosition.x,
                    y: selectionPosition.y - componentPosition.y - 20,
                    href: resource.data.url,
                    type: 'EXTERNAL_HYPERLINK'
                  }
                } );
              }
            }
            catch ( e ) {
              console.error( e );/* eslint no-console : 0 */
            }
          }

        }
        else if ( entityAtSelection.getType() === 'SECTION_POINTER' ) {
          const targetSection = this.props.story && this.props.story.sections[entityAtSelection.getData().sectionId];
          const title = ( targetSection && targetSection.metadata.title ) || this.translate( 'deleted section' );
          try {
              const selection = window.getSelection();
              const selectionPosition = selection.getRangeAt( 0 ).getBoundingClientRect();
              const componentPosition = this.component.getBoundingClientRect();
              if ( selectionPosition ) {
                return this.setState( {
                  linkPopupData: {
                    x: selectionPosition.x - componentPosition.x,
                    y: selectionPosition.y - componentPosition.y - 20,
                    title,
                    type: 'SECTION_POINTER'
                  }
                } );
              }
            }
            catch ( e ) {
              console.error( e );/* eslint no-console : 0 */
            }
        }

      }
      else if ( this.state.linkPopupData ) {
        setTimeout( () => {
          if ( this.state.linkPopupData ) {
            this.setState( {
              linkPopupData: undefined
            } );
          }
        }, MEDIUM_TIMEOUT );
      }
    }
  }

  getEntityAtSelection( editorState ) {

    if ( !editorState ) {
      return undefined;
    }
    const selection = editorState.getSelection();
    if ( !selection.getHasFocus() ) {
      return undefined;
    }

    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey( selection.getStartKey() );
    if ( !!block.getEntityAt( selection.getStartOffset() - 1 ) ) {
      const entityKey = block.getEntityAt( selection.getStartOffset() - 1 );
      return { entity: contentState.getEntity( entityKey ), entityKey };
    }
    return undefined;
  }

  clearNotesAndContext = () => {

    /*
     * delete unused notes
     * const prevSection = this.props.activeSection;
     * if (prevSection) {
     *   const newSection = {
     *     ...prevSection,
     *     notes: prevSection.notesOrder.reduce((res, noteId) => ({
     *       ...res,
     *       [noteId]: prevSection.notes[noteId]
     *     }), {})
     *   };
     *   // delete unused contextualizations
     *   // updateContextualizationsFromEditor(this.props);
     *   this.props.updateSection(newSection);
     */

    /*
     *   // update all raw contents
     *   const notesIds = Object.keys(prevSection.notes);
     *   notesIds.forEach(noteId => this.updateSectionRawContent(noteId, this.props.story.id, this.props.activeSection.id));
     *   this.updateSectionRawContent('main', this.props.story.id, this.props.activeSection.id);
     * }
     */
  }

  updateStateFromProps = ( props ) => {
    if ( !this || !this.state ) {
      return;
    }
    const assets = computeAssets( props );
    const citations = buildCitations( assets, props );

    this.setState( {/* eslint react/no-set-state : 0 */
      assets,
      assetChoiceProps: computeAssetChoiceProps( props ),
      customContext: {
        citations,
        selectedContextualizationId: props.selectedContextualizationId,
      },
      citations,
    } );
  }

  ElementLayoutComponent = ( { children } ) => (
    <ElementLayout
      isSize={ this.props.editorWidth }
      isOffset={ this.props.editorOffset }
    >
      {children}
    </ElementLayout>
  )

  onKeyUp = ( e ) => {
    // backspace -> delete contextualization if selected
    if ( e.keyCode && this.props.selectedContextualizationId ) {
      this.props.deleteContextualizationFromId( this.props.selectedContextualizationId );
      this.props.setEditorFocus( this.props.previousEditorFocus );
    }
  }

  /**
   * Handles user cmd+c like command (storing stashed contextualizations among other things)
   */
  onCopy = ( e ) => {
    this.handleCopy( e );
  }

  /**
   * Handles user cmd+v like command (restoring stashed contextualizations among other things)
   */
  onPaste = ( e ) => {
    if ( this.props.editorFocus ) {
      silentEvent( e );
    }
  }

  /**
   * Monitors operations that look into the editor state
   * to see if contextualizations and notes have to be updated/delete
   * (this operation is very expensive in performance and should
   * always be wrapped in a debounce)
   */
  cleanStuffFromEditorInspection = () => {
    updateNotesFromSectionEditor( this.props );
  }

    /**
     * Determines whether the editor should show its placeholder.
     * See https://draftjs.org/docs/api-reference-editor.html#placeholder
     * for details on why this is useful.
     * // Taken from https://github.com/springload/draftail/blob/4ff6be3b8134881deaf51cda02f076183be7f358/lib/api/DraftUtils.js#L234-L243
     */
    shouldHidePlaceholder( editorState ) {
      const contentState = editorState.getCurrentContent();
      return (
          contentState.hasText() ||
          contentState
              .getBlockMap()
              .first()
              .getType() === 'unordered-list-item'
      );
    }

  deleteNote = ( id ) => {
    const {
      editorStates,
      activeSection,
      updateSection,
      updateDraftEditorState,
      setEditorFocus,
    } = this.props;
    const { id: sectionId } = activeSection;
    const mainEditorState = editorStates[sectionId];
    // scroll to the position of deletion
    this.editor.scrollToNotePointer( id );
    // remove related entity in main editor
    deleteNoteFromEditor( mainEditorState, id, ( newEditorState ) => {

      /*
       * remove note
       * const notes = activeSection.notes;
       * delete notes[id]; // commented for keeping it for undo-redo purposes
       * update section
       */
      updateSection( {
        ...activeSection,
        contents: convertToRaw( newEditorState.getCurrentContent() ),
        notesOrder: activeSection.notesOrder.filter( ( thatNoteId ) => thatNoteId !== id )
        // notes
      } );
      // update editor
      updateDraftEditorState( sectionId, newEditorState );
      updateDraftEditorState( id, undefined );
      // focus on main editor
      setTimeout( () => {
        setEditorFocus( 'main' );
        ReactTooltip.rebuild();
      } );
    } );
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

    const { id: sectionId } = activeSection;

    const id = generateId();
    // add related entity in main editor
    const mainEditorState = insertNoteInEditor( editorStates[sectionId], id );
    // prepare notes with immutable editorState
    const activeNotes = Object.keys( activeSection.notes ).reduce( ( fNotes, nd ) => ( {
      ...fNotes,
      [nd]: {
        ...activeSection.notes[nd]
      }
    } ), {} );
    // add note
    const notes = {
      ...activeNotes,
      [id]: {
        id,
        editorState: this.editor.generateEmptyEditor(),
        contents: convertToRaw( this.editor.generateEmptyEditor().getCurrentContent() )
      }
    };
    const {
      // newNotes,
      notesOrder
    } = updateNotesFromEditor( mainEditorState, notes );
    // notes = newNotes;
    const newSection = {
      ...activeSection,
      notesOrder,
      contents: convertToRaw( mainEditorState.getCurrentContent() ),
      notes: Object.keys( notes ).reduce( ( fNotes, nd ) => ( {
        ...fNotes,
        [nd]: {
          ...notes[nd],
          contents: notes[nd].contents || convertToRaw( this.editor.generateEmptyEditor().getCurrentContent() )
        }
      } ), {} )
    };
    const newEditors = Object.keys( notes ).reduce( ( fEditors, nd ) => ( {
      ...fEditors,
      [nd]: editorStates[nd] || EditorState.createWithContent(
              convertFromRaw( notes[nd].contents ),
              this.editor.mainEditor.createLocalDecorator()
            )
    } ), {
      [sectionId]: mainEditorState
    } );
    // update contents
    this.props.updateSection( newSection );
    // update editors
    this.props.updateDraftEditorsStates( newEditors );
    setTimeout( () => {
      this.props.setEditorFocus( id );
      this.editor.scrollToNote( id );
      // this.editor.focus(id);
    }, MEDIUM_TIMEOUT );
  }

  /**
   * Handle changes on contextualizers or resources
   * from within the editor
   * @param {string} dataType - the type of collection where the object to update is located
   * @param {string} dataId - the id of the object
   * @param {object} data - the new data to apply to the object
   */
  onDataChange = ( dataType, dataId, data ) => {
    const {
      updateContextualizer,
      story: {
        id: storyId,
      },
      userId
    } = this.props;
    if ( dataType === 'contextualizer' ) {
      updateContextualizer( {
        storyId,
        userId,
        contextualizerId: data.id,
        contextualizer: data
      } );
    }
  }

  /**
   * Callbacks when an asset is requested
   * @param {string} contentId - the id of the target editor ('main' or noteId)
   * @param {ImmutableRecord} inputSelection - the selection to request the asset at
   */
  onAssetRequest = ( contentId, inputSelection ) => {
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
    if ( editedEditorState ) {
      const thatSelection = editedEditorState.getSelection();
      if ( thatSelection.isCollapsed() ) {
        const content = editedEditorState.getCurrentContent();
        const selectedBlockKey = thatSelection.getStartKey();
        const selectedBlock = content.getBlockForKey( selectedBlockKey );
        const entityKey = selectedBlock.getEntityAt( thatSelection.getStartOffset() );
        if ( entityKey ) {
          const entityData = content.getEntity( entityKey ).getData();
          if ( entityData.asset && entityData.asset.id ) {
            const contextualization = story.contextualizations[entityData.asset.id];
            const resource = story.resources[contextualization.resourceId];
            return startExistingResourceConfiguration( resource.id );
          }
        }
      }
    }

    setEditorFocus( undefined );
    setTimeout( () => {
      setEditorFocus( contentId );
    } );
    // register assetRequestState
    requestAsset( editorId, selection );
  }

  hydrateEditorStates = ( activeSection ) => {
    const editors = Object.keys( activeSection.notes || {} )
        // notes' editor states hydratation
        .reduce( ( eds, noteId ) => ( {
          ...eds,
          [noteId]: activeSection.notes[noteId].contents && activeSection.notes[noteId].contents.entityMap ?
          EditorState.createWithContent(
            convertFromRaw( activeSection.notes[noteId].contents ),
            this.editor.mainEditor.createLocalDecorator()
          )
          : this.editor.generateEmptyEditor()
        } ),
        // main editor state hydratation
        {
          [activeSection.id]: activeSection.contents && activeSection.contents.entityMap ?
            EditorState.createWithContent(
              convertFromRaw( activeSection.contents ),
              this.editor.mainEditor.createLocalDecorator()
            )
            : this.editor.generateEmptyEditor()
        } );
    this.props.updateDraftEditorsStates( editors );
    // TODO: manually set story is saved for now, need to optimized
    this.props.setStoryIsSaved( true );
  }

  updateSectionRawContent = ( editorStateId, storyId, sectionId ) => {
    const section = this.props.story.sections[sectionId];

    const finalEditorStateId = editorStateId === 'main' ? sectionId : editorStateId;
    const finalEditorState = this.props.editorStates[finalEditorStateId];

    /*
     * as the function is debounced it would be possible
     * not to have access to the final editor state
     */
    if ( !finalEditorState ) {
      return;
    }
    const rawContent = convertToRaw( finalEditorState.getCurrentContent() );

    let newSection;
    // this.props.update(this.state.editorState);
    if ( editorStateId === 'main' ) {
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

    this.props.updateSection( newSection );
    // checking that component is mounted
    if ( this.component ) {
      const citations = buildCitations( this.state.assets, this.props );
      this.setState( {
        citations,
        customContext: {
          citations,
          selectedContextualizationId: this.props.selectedContextualizationId
        }
      } );
    }
  }

  removeFormattingForSelection = () => {
    const { editorFocus, editorStates, activeSection } = this.props;
    const { id: sectionId } = activeSection;
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
    styles.forEach( ( style ) => {
      newEditorState = EditorState.push(
        newEditorState,
        Modifier.removeInlineStyle( newEditorState.getCurrentContent(), newEditorState.getSelection(), style ),
        'remove-inline-style'
      );
    } );

    this.onEditorChange( editorFocus, newEditorState );

  }

  /**
   * Util for Draft.js strategies building
   */
  findWithRegex = ( regex, contentBlock, callback ) => {
    const text = contentBlock.getText();
    let matchArr;
    let start;
    while ( ( matchArr = regex.exec( text ) ) !== null ) {
      start = matchArr.index;
      callback( start, start + matchArr[0].length );
    }
  }

  /**
   * Draft.js strategy for finding draft js drop placeholders
   * @param {ImmutableRecord} contentBlock - the content block in which entities are searched
   * @param {function} callback - callback with arguments (startRange, endRange, props to pass)
   * @param {ImmutableRecord} inputContentState - the content state to parse
   */
  findDraftDropPlaceholder = ( contentBlock, callback ) => {
    const PLACE_HOLDER_REGEX = /(DRAFTJS_RESOURCE_ID:[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})/gi;
    this.findWithRegex( PLACE_HOLDER_REGEX, contentBlock, callback );
  }

  /**
   * Draft.js strategy for finding native links
   * @param {ImmutableRecord} contentBlock - the content block in which entities are searched
   * @param {function} callback - callback with arguments (startRange, endRange, props to pass)
   * @param {ImmutableRecord} inputContentState - the content state to parse
   */
  findLink = ( contentBlock, callback, contentState ) => {
      let props;
      contentBlock.findEntityRanges(
        ( character ) => {
          const entityKey = character.getEntity();
          if (
            entityKey !== null &&
            contentState.getEntity( entityKey ).getType() === 'LINK'
          ) {
            props = { ...contentState.getEntity( entityKey ).getData() };
            return true;
          }
        },
        ( from, to ) => {
          callback( from, to, props );
        }
      );
    }

  /**
   * Draft.js strategy for finding internal links
   * @param {ImmutableRecord} contentBlock - the content block in which entities are searched
   * @param {function} callback - callback with arguments (startRange, endRange, props to pass)
   * @param {ImmutableRecord} inputContentState - the content state to parse
   */
  findInternalLink = ( contentBlock, callback, contentState ) => {
      let props;
      contentBlock.findEntityRanges(
        ( character ) => {
          const entityKey = character.getEntity();
          if (
            entityKey !== null &&
            contentState.getEntity( entityKey ).getType() === 'SECTION_POINTER'
          ) {
            props = { ...contentState.getEntity( entityKey ).getData() };
            return true;
          }
        },
        ( from, to ) => {
          callback( from, to, props );
        }
      );
    }

  inlineButtons = () => [
    
    <HeaderOneButton
      tooltip={ this.translate( 'big title' ) }
      key={ 4 }
    />,
    <HeaderTwoButton
      tooltip={ this.translate( 'small title' ) }
      key={ 5 }
    />,
    <OrderedListItemButton
      tooltip={ this.translate( 'ordered list' ) }
      key={ 6 }
    />,
    <UnorderedListItemButton
      tooltip={ this.translate( 'unordered list' ) }
      key={ 7 }
    />,
    <BlockQuoteButton
      tooltip={ this.translate( 'quote' ) }
      key={ 3 }
    />,
    <Button isDisabled key={'sep-2'} />,
    <BoldButton
      tooltip={ this.translate( 'bold text' ) }
      key={ 1 }
    />,
    <ItalicButton
      tooltip={ this.translate( 'italic text' ) }
      key={ 2 }
    />,
    <RemoveFormattingButton
      tooltip={ this.translate( 'remove formatting for selection' ) }
      key={ 9 }
    />,
    <Button isDisabled key={'sep-1'} />,
    <GlossaryButton
      tooltip={ this.translate( 'add a link to a glossary entry' ) }
      key={ 9 }
    />,
    <LinkButton
      tooltip={ this.translate( 'add a link to a webpage' ) }
      key={ 10 }
    />,
    <InternalLinkButton
      tooltip={ this.translate( 'add a link to another section' ) }
      key={ 11 }
    />,

    /*<CodeBlockButton />,*/
  ]

  onEditorChange = ( editorId, editorState ) => {
    const { activeSection: { id: sectionId }, story: { id: activeStoryId }, updateDraftEditorState, editorStates, setStoryIsSaved } = this.props;
    const { updateSectionRawContentDebounced } = this;
    const editorStateId = editorId === 'main' ? sectionId : editorId;

    /*
     * update active immutable editor state
     */
    updateDraftEditorState( editorStateId, editorState );
    const currentEditorState = editorStates[editorStateId];
    if ( currentEditorState && currentEditorState.getCurrentContent() !== editorState.getCurrentContent() ) {
      setStoryIsSaved( false );
      updateSectionRawContentDebounced( editorId, activeStoryId, sectionId );
    }
  };

  handleEditorPaste = ( text, html ) => {
    if ( html ) {
      const preventDefault = this.handlePaste( html );
      return preventDefault;
    }
    return false;
  }

  getNotePointer = () => NotePointer;

  getInlineAssetComponents = () => inlineAssetComponents;

  getAdditionalEntities = () => {
    return [
      {
        strategy: this.findDraftDropPlaceholder,
        component: ( { children } ) =>
          (
            <Tag
              style={ { pointerEvents: 'none' } }
              className={ 'is-rounded' }
              isColor={ 'dark' }
            >
              {this.translate( 'loading' )}
              <span style={ { display: 'none' } }>{children}</span>
            </Tag>
          )
      },
      {
        strategy: this.findLink,
        component: ( { children, url } ) => {
          return (
            <span className={ 'native-link' }>
              <span className={ 'link-content' }>
                <span>{children}</span>
                <span className={ 'pin-container' }>
                  <HelpPin>
                    {this.translate( 'native link to {u}', { u: url } )}
                  </HelpPin>
                </span>
              </span>
            </span>
          );
        }
      },
      {
        strategy: this.findInternalLink,
        component: ( { children/*, sectionId*/ } ) => {
          return (
            <span className={ 'internal-link' }>
              <span className={ 'internal-link-content' }>
                <span
                  style={ { color: '#197212' } }
                >{children}
                </span>

              </span>
            </span>
          );
        }
      }
    ];
  }

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render = () => {

    /**
     * Variables definition
     */
    const {
      addNote,
      deleteNote,
      onAssetRequest: handleAssetRequest,
      onDataChange: handleDataChange,
      state,
      props,
      onEditorChange: handleEditorChange,
      handleEditorPaste,
      ElementLayoutComponent,
      // onEditCursoredInternalLink,
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

      /*
       * selectedContextualizationId,
       * editorWidth,
       * editorOffset,
       */
      style: componentStyle = {},
    } = props;

    const {
      clipboard,
      assets = {},
      assetChoiceProps = {},
      citations,
      customContext,
      linkPopupData,
    } = state;

    const {
        citationItems,
        citationData
      } = citations;
    if ( !story || !activeSection ) {
      return null;
    }

    const {
      notes: inputNotes,
      notesOrder,
      id: sectionId,
    } = activeSection;

    /**
     * Computed variables
     */
    const mainEditorState = editorStates[sectionId];
    // replacing notes with dynamic non-serializable editor states
    const notes = inputNotes ? Object.keys( inputNotes ).reduce( ( no, id ) => ( {
      ...no,
      [id]: {
        ...inputNotes[id],
        editorState: editorStates[id]
      }
    } ), {} ) : {};

    let RealAssetComponent = EmbedAssetComponent;

    // let clipboard;
    const focusedEditorId = editorFocus;

    const editorStateId = focusedEditorId === 'main' ? sectionId : focusedEditorId;

    const editedEditorState = editorStates[editorStateId];
    let cursorOnResourceType;
    let cursorOnInternalLink;
    if ( editedEditorState ) {
      const selection = editedEditorState.getSelection();
      if ( selection.isCollapsed() ) {
        const content = editedEditorState.getCurrentContent();
        const selectedBlockKey = selection.getStartKey();
        const selectedBlock = content.getBlockForKey( selectedBlockKey );
        const entityKey = selectedBlock.getEntityAt( selection.getStartOffset() );
        if ( entityKey ) {
          const entityData = content.getEntity( entityKey ).getData();
          if ( entityData.asset && entityData.asset.id ) {
            const contextualization = story.contextualizations[entityData.asset.id];
            const resource = story.resources[contextualization.resourceId];
            cursorOnResourceType = resource.metadata.type;
          }
          else if ( content.getEntity( entityKey ).getType() === 'SECTION_POINTER' ) {
            cursorOnInternalLink = true;
          }
        }
      }
    }
    if ( cursorOnResourceType ) {
      RealAssetComponent = this.assetButtons[cursorOnResourceType];
    }
    else if ( cursorOnInternalLink ) {
      RealAssetComponent = this.internalLinkButton;
    }

    // define citation style and locales, falling back on defaults if needed
    const { style, locale } = getCitationModels( story );
    // additional inline entities to display in the editor
    const additionalInlineEntities = this.getAdditionalEntities();
    const inlineButtons = this.inlineButtons();

    let shouldHidePlaceholder;
    if ( focusedEditorId ) {
      const editorState = focusedEditorId === 'main' ? mainEditorState : notes[focusedEditorId].editorState;
      if ( editorState ) {
        shouldHidePlaceholder = this.shouldHidePlaceholder( editorState );
      }
    }

    const messages = {
      addNote: this.translate( 'add-note' ),
      summonAsset: this.translate( 'summon-asset' ),
      cancel: this.translate( 'cancel' ),
    };

    const placeholderText = this.translate( 'start writing' );

    /**
     * Local functions
     */
    /**
     * Callbacks handlers
     */

    // used callbacks
    const handleAssetChoice = ( option, contentId ) => {
      const { id } = option;
      let targetedEditorId = contentId;
      if ( !targetedEditorId ) {
        targetedEditorId = this.props.editorFocus;
      }
      cancelAssetRequest();
      summonAsset( targetedEditorId, id );
      setEditorFocus( undefined );
      setTimeout( () => {
        setEditorFocus( targetedEditorId );
        this.updateStateFromProps( this.props );
        setTimeout( () => this.updateStateFromProps( this.props ) );
      }, timers.medium );
    };
    const blockAssetTypes = [ 'image', 'table', 'video', 'embed' ];

    const handleDrop = ( contentId, payload, selection ) => {
      if ( draggedResourceId ) {
        let targetedEditorId = contentId;
        if ( !targetedEditorId ) {
          targetedEditorId = this.props.editorFocus;
        }

        const editorId = contentId === 'main' ? activeSection.id : contentId;
        const draggedResource = story.resources[draggedResourceId];
        if ( contentId !== 'main' && blockAssetTypes.includes( draggedResource.metadata.type ) ) {
          // set error message when try drag a block asset into note
          this.props.setErrorMessage( { type: 'CREATE_CONTEXTUALIZATION_NOTE_FAIL', error: `${draggedResource.metadata.type} could not be added into note` } );
        }
        else {
          const editorState = editorStates[editorId];
          // updating selection to take into account the drop payload
          const rightSelectionState = new SelectionState( {
            anchorKey: selection.getStartKey(),
            anchorOffset: selection.getStartOffset() - payload.length,
            focusKey: selection.getEndKey(),
            focusOffset: selection.getEndOffset() - payload.length
          } );
          updateDraftEditorState( editorId, EditorState.forceSelection( editorState, rightSelectionState ) );
          handleAssetChoice( { id: draggedResourceId }, contentId );
        }
      }
    };

    const handleDragOver = ( contentId ) => {
      if ( focusedEditorId !== contentId ) {
        setEditorFocus( contentId );
      }
    };
    const handleClick = ( event, contentId = 'main' ) => {
      if ( focusedEditorId !== contentId ) {
        if ( this.props.assetRequestState ) {
          this.props.setAssetRequestContentId( contentId );
        }
        setEditorFocus( contentId );

        /*
         * setEditorFocus(undefined);
         * setTimeout(() => setEditorFocus(contentId));
         */
      }
    };

    const handleBlur = ( event, contentId = 'main' ) => {
      if ( contentId !== 'main' ) {
        this.updateSectionRawContent( contentId, story.id, activeSection.id );
      }
      event.stopPropagation();

      /*
       * if focus has not be retaken by another editor
       * after a timeout, blur the whole editor
       * "- be my guest ! - no, you first ! - thank you madame."
       */
      setTimeout( () => {
        if ( focusedEditorId === contentId && !assetRequestPosition ) {
          setEditorFocus( undefined );
        }
        if ( contentId !== 'main' ) {
          this.updateSectionRawContent( contentId, this.props.activeStoryId, this.props.activeSection.id );
        }
      } );
    };

    const handleScroll = () => {
      if ( focusedEditorId === 'main' ) {
        this.editor.mainEditor.updateSelection();
      }
      else if ( focusedEditorId && this.editor.notes[focusedEditorId] ) {
        this.editor.notes[focusedEditorId].editor.updateSelection();
      }
      if ( this.state.linkPopupData ) {
        this.updateLinkPopupData();
      }
    };

    const handleAssetRequestCancel = () => {
      cancelAssetRequest();
      setEditorFocus( undefined );
      setTimeout( () => {
        setEditorFocus( focusedEditorId );
      }, timers.short );
    };

    const handleNotePointerMouseClick = ( noteId ) => {
      setTimeout( () => setEditorFocus( noteId ) );
    };

    /**
     * References bindings
     */
    const bindRef = ( component ) => {
      this.component = component;
    };

    const bindEditorRef = ( editor ) => {
      this.editor = editor;
    };

    return (
      <Content
        style={ componentStyle }
        className={ 'fonio-SectionEditor' }
      >
        <div
          ref={ bindRef }
          className={ `editor-wrapper ${shouldHidePlaceholder ? 'hide-placeholder' : ''}` }
          onScroll={ handleScroll }
        >
          <ReferencesManager
            style={ style }
            locale={ locale }
            items={ citationItems }
            citations={ citationData }
          >
            <Editor
              AssetButtonComponent={ RealAssetComponent }
              AssetChoiceComponent={ ResourceSearchWidget }
              NotePointerComponent={ NotePointer }
              editorPlaceholder={ placeholderText }
              inlineEntities={ additionalInlineEntities }
              onAssetChange={ handleDataChange }
              onAssetChoice={ handleAssetChoice }
              onAssetRequest={ handleAssetRequest }
              onAssetRequestCancel={ handleAssetRequestCancel }
              onBlur={ handleBlur }
              onClick={ handleClick }
              onDragOver={ handleDragOver }
              onDrop={ handleDrop }
              onEditorChange={ handleEditorChange }
              onNoteAdd={ addNote }
              onNoteDelete={ deleteNote }
              onNotePointerMouseClick={ handleNotePointerMouseClick }
              ref={ bindEditorRef }
              BibliographyComponent={ null }
              assets={ assets }
              customContext={ customContext }
              handlePastedText={ handleEditorPaste }
              mainEditorState={ mainEditorState }
              notes={ notes }
              notesOrder={ notesOrder }

              {
                ...{
                   clipboard,
                   focusedEditorId,
                   inlineButtons,
                   messages,
                   assetRequestContentId,
                   assetRequestPosition,
                   assetChoiceProps,
                   NoteLayout,
                   NoteButtonComponent,
                   ElementLayoutComponent,
                   inlineAssetComponents,
                   blockAssetComponents,
                }
              }

            />
          </ReferencesManager>
        </div>
        {
          linkPopupData &&
          <span
            className={ 'tag' }
            style={ {
              position: 'absolute',
              left: linkPopupData ? linkPopupData.x : 0,
              top: linkPopupData ? linkPopupData.y : 0,
              display: linkPopupData ? 'flex' : 'none',
              flexFlow: 'row nowrap',
              alignItems: 'center',
            } }
          >
            {
            linkPopupData.type === 'EXTERNAL_HYPERLINK' ?
              <span
                style={ {
                display: 'flex',
                flexFlow: 'row nowrap',
                alignItems: 'center',
              } }
              >
                <a
                  target={ 'blank' }
                  rel={ 'no-follow' }
                  href={ linkPopupData ? linkPopupData.href : '' }
                >
                  {linkPopupData ? abbrevString( linkPopupData.href, 30 ) : ''}
                </a>
                <Image
                  style={ { margin: 0, padding: 0 } }
                  isSize={ '16x16' }
                  src={ icons.webpage.black.svg }
                />
              </span>
            :
              <span
                style={ {
                display: 'flex',
                flexFlow: 'row nowrap',
                alignItems: 'center'
              } }
              >
                <span>
                  {abbrevString( linkPopupData.title, 60 )}
                </span>
                <Image
                  style={ { margin: 0, padding: 0 } }
                  isSize={ '16x16' }
                  src={ require( '../../sharedAssets/internal-link.svg' ) }
                />
              </span>

          }

          </span>
        }
        <ReactTooltip
          id={ 'style-button' }
          place={ 'top' }
          effect={ 'solid' }
        />
        <ReactTooltip
          id={ 'icon-btn-tooltip' }
        />
      </Content>
    );
  }
}

/**
 * Component's properties types
 */
SectionEditor.propTypes = {

  /**
   * active section data
   */
  activeSection: PropTypes.object,

  /**
   * represents the position of current asset request
   */
  assetRequestPosition: PropTypes.object,

  /**
   * callbacks when asset request state is cancelled
   */
  cancelAssetRequest: PropTypes.func,

  /**
   * represents the current editor focused in the editor ('main' or noteId)
   */
  editorFocus: PropTypes.string,

  /**
   * map of all available draft-js editor states
   */
  editorStates: PropTypes.object,

  setAssetRequestContentId: PropTypes.func,

  /**
   * callbacks when focus on a specific editor among main
   * and notes' editors is asked
   */
  setEditorFocus: PropTypes.func,

  /**
   * active story (needed to access resources and contextualizers
   * which are at story's level)
   */
  story: PropTypes.object,

  /**
   * callbacks when an asset insertion is asked
   */
  summonAsset: PropTypes.func,

  /**
   * callbacks when a draft editor has to be updated
   */
  updateDraftEditorState: PropTypes.func,

   /**
    * callbacks when a whole section is asked to be updated
    */
  updateSection: PropTypes.func,
};

SectionEditor.childContextTypes = {
  deleteContextualizationFromId: PropTypes.func,
  removeFormattingForSelection: PropTypes.func,
  selectedContextualizationId: PropTypes.string,
  setSelectedContextualizationId: PropTypes.func,
  startExistingResourceConfiguration: PropTypes.func,
  startNewResourceConfiguration: PropTypes.func,
};

export default SectionEditor;
