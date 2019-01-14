/**
 * This module provides a connected component for handling the section view
 * @module fonio/features/SectionView
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { v4 as genId } from 'uuid';
import {
  withRouter,
} from 'react-router';
import {
  EditorState,
  convertToRaw,
  Modifier
} from 'draft-js';

/**
 * Imports Project utils
 */

import {
  summonAsset,
  deleteUncitedContext
} from '../../../helpers/assetsUtils';

import {
  getUserResourceLockId,
  getReverseSectionsLockMap,
} from '../../../helpers/lockUtils';

import { createResourceData, validateFiles } from '../../../helpers/resourcesUtils';
import { createDefaultResource } from '../../../helpers/schemaUtils';

/**
 * Imports Ducks
 */
import * as duck from '../duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as storyDuck from '../../StoryManager/duck';
import * as sectionsManagementDuck from '../../SectionsManager/duck';
import * as libarayViewDuck from '../../LibraryView/duck';
import * as errorMessageDuck from '../../ErrorMessageManager/duck';
import * as editionUiDuck from '../../EditionUiWrapper/duck';

/**
 * Imports Components
 */
import EditionUiWrapper from '../../EditionUiWrapper/components';
import UploadModal from '../../../components/UploadModal';
import PastingModal from '../../../components/PastingModal';
import DataUrlProvider from '../../../components/DataUrlProvider';
import SectionViewLayout from './SectionViewLayout';

/**
 * Imports Assets
 */
import config from '../../../config';

/**
 * Shared variables
 */
const { maxBatchNumber } = config;
const SHORT_TIMEOUT = 100;

@connect(
  ( state ) => ( {
    ...connectionsDuck.selector( state.connections ),
    ...storyDuck.selector( state.editedStory ),
    ...sectionsManagementDuck.selector( state.sectionsManagement ),
    ...libarayViewDuck.selector( state.library ),
    ...duck.selector( state.section ),
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      ...editionUiDuck,
      ...connectionsDuck,
      ...storyDuck,
      ...sectionsManagementDuck,
      ...libarayViewDuck,
      ...errorMessageDuck,
      ...duck,
    }, dispatch )
  } )
)
class SectionViewContainer extends Component {

  static childContextTypes = {
    setDraggedResourceId: PropTypes.func,
    setLinkModalFocusData: PropTypes.func,
    setGlossaryModalFocusData: PropTypes.func,
    setInternalLinkModalFocusData: PropTypes.func,
    editorFocus: PropTypes.string,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  constructor( props ) {
    super( props );
  }

  getChildContext = () => ( {
    setDraggedResourceId: this.setDraggedResourceId,
    setLinkModalFocusData: this.setLinkModalFocusData,
    setGlossaryModalFocusData: this.setGlossaryModalFocusData,
    setInternalLinkModalFocusData: this.setInternalLinkModalFocusData,
    editorFocus: this.props.editorFocus,
  } )

  componentDidMount = () => {
    window.addEventListener( 'beforeunload', this.confirmExit );
    // require lock if edited story is here
    if ( this.props.editedStory ) {
      this.requireLockOnSection( this.props );
    }
    this.props.actions.resetDraftEditorsStates();
    this.props.actions.setEditedSectionId( this.props.match.params.sectionId );
  }

  componentWillReceiveProps = ( nextProps ) => {

    /**
     * if section id or story id is changed leave previous section and try to lock on next section
     */
    const {
      match: {
        params: {
          sectionId: prevSectionId,
          storyId: prevStoryId
        }
      },
      editorStates,
      lockingMap: prevLockingMap,
      userId,
    } = this.props;
    const {
      match: {
        params: {
          sectionId: nextSectionId,
          storyId: nextStoryId
        }
      },
      history,
      promptedToDeleteSectionId,
      lockingMap,
      activeUsers,
      actions: {
        setPromptedToDeleteSectionId
      }
    } = nextProps;

    // if lock is lost (e.g. after idle-then-loose-block usecases) redirect to summary
    if (
        prevLockingMap && prevLockingMap[prevStoryId] &&
        lockingMap && lockingMap[nextStoryId] &&
        prevLockingMap[prevStoryId].locks[userId] && lockingMap[nextStoryId].locks[userId] &&
        prevLockingMap[prevStoryId].locks[userId].sections &&
        prevLockingMap[prevStoryId].locks[userId].sections.blockId === nextSectionId &&
        !lockingMap[nextStoryId].locks[userId].sections
      ) {
      history.push( `/story/${nextStoryId}` );
    }

    /**
     * @todo skip this conditional with another strategy relying on components architecture
     */
    if ( !this.props.editedStory && nextProps.editedStory ) {
      this.requireLockOnSection( this.props );
    }
    // changing section
    if ( prevSectionId !== nextSectionId || prevStoryId !== nextStoryId ) {
      // updating active section id
      this.props.actions.setEditedSectionId( nextSectionId );
      // packing up : saving all last editor states
      const section = this.props.editedStory.sections[prevSectionId];
      const newSection = {
        ...section,
        contents: editorStates[prevSectionId] ? convertToRaw( editorStates[prevSectionId].getCurrentContent() ) : section.contents,
        notes: Object.keys( section.notes || {} ).reduce( ( result, noteId ) => ( {
          ...result,
          [noteId]: {
            ...section.notes[noteId],
            contents: editorStates[noteId] ? convertToRaw( editorStates[noteId].getCurrentContent() ) : section.notes[noteId].contents,
          }
        } ), {} )
      };
      this.props.actions.updateSection( {
        sectionId: prevSectionId,
        storyId: prevStoryId,
        userId,
        section: newSection
      } );
      this.unlockOnSection( this.props );
      this.requireLockOnSection( nextProps );
      this.props.actions.resetDraftEditorsStates();
      this.props.actions.setEmbedResourceAfterCreation( false );
      this.props.actions.setNewResourceType( undefined );
      this.props.actions.setEditedSectionId( undefined );
    }

    /*
     * if modal to delete section was prompted and in the meantime someone has entered this section
     * then we unset the delete prompt on that section
     */
    const reverseSectionLockMap = getReverseSectionsLockMap( lockingMap, activeUsers, nextStoryId );
    if ( promptedToDeleteSectionId && reverseSectionLockMap[promptedToDeleteSectionId] ) {
      setPromptedToDeleteSectionId( undefined );
    }
  }

  // componentWillUpdate = () => {
  //   console.time('container update time');/* eslint no-console: 0 */
  // }

  // componentDidUpdate = () => {
  //   console.timeEnd('container update time');/* eslint no-console: 0 */
  // }

  componentWillUnmount = () => {
    this.unlockOnSection( this.props );
    this.props.actions.setEditorFocus( undefined );
    this.props.actions.setEditedSectionId( undefined );
    this.props.actions.resetDraftEditorsStates();
    this.props.actions.resetViewsUi();
  }

  confirmExit = ( e ) => {
    const { storyIsSaved } = this.props;
    if ( !storyIsSaved ) {
      const confirmationMessage = '\o/';
      e.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
      return confirmationMessage;
    }
  }

  setDraggedResourceId = ( resourceId ) => {
    this.props.actions.setDraggedResourceId( resourceId );
  }

  setLinkModalFocusData = ( focusId ) => {
    const {
      match: {
        params: {
          sectionId,
          // storyId
        }
      },
    } = this.props;
    const editorId = focusId === 'main' ? sectionId : focusId;
    const selection = this.props.editorStates[editorId].getSelection();
    this.props.actions.setLinkModalFocusData( { focusId, selection } );
  }

  setGlossaryModalFocusData = ( focusId ) => {
    const {
      match: {
        params: {
          sectionId,
          // storyId
        }
      },
    } = this.props;
    const editorId = focusId === 'main' ? sectionId : focusId;
    const selection = this.props.editorStates[editorId].getSelection();
    this.props.actions.setGlossaryModalFocusData( { focusId, selection } );
  }

  getInactiveSections = () => {
    const {
      match: {
        params: {
          sectionId,
          // storyId
        }
      },
      editedStory,
    } = this.props;
    return editedStory.sectionsOrder.filter( ( id ) => id !== sectionId )
      .map( ( id ) => ( {
        id,
        ...editedStory.sections[id].metadata
      } ) );
  }

  setInternalLinkModalFocusData = ( focusId ) => {
    const {
      match: {
        params: {
          sectionId,
          // storyId
        }
      },
    } = this.props;
    const editorId = focusId === 'main' ? sectionId : focusId;
    const selection = this.props.editorStates[editorId].getSelection();
    this.props.actions.setInternalLinkModalFocusData( { focusId, selection } );
  }

  unlockOnSection = ( props ) => {
    const {
      match: {
        params: {
          sectionId,
          storyId
        }
      },
      userId,
      lockingMap,
    } = props;
    if ( lockingMap && lockingMap[storyId] && lockingMap[storyId].locks[userId] ) {
      deleteUncitedContext( sectionId, props );
      this.props.actions.leaveBlock( {
        blockId: sectionId,
        storyId,
        userId,
        blockType: 'sections',
      } );
    }
  }

  requireLockOnSection = ( props ) => {
    const {
      match: {
        params: {
          sectionId,
          storyId
        }
      },
      userId
    } = props;
    this.props.actions.enterBlock( {
      blockId: sectionId,
      storyId,
      userId,
      blockType: 'sections',
    }, ( err ) => {
      if ( err ) {

        /**
         * ENTER_BLOCK_FAIL
         * If section lock is failed/refused,
         * this means another client is editing the section
         * -> for now the UI behaviour is to get back client to the summary view
         */
        this.props.history.push( `/story/${storyId}/` );
      }
      else {

        /*
         * ENTER_BLOCK_SUCCESS
         * this.goToSection(sectionId);
         */
      }
    } );
  }

  goToSection = ( sectionId ) => {
    const {
      editedStory: {
        id
      }
    } = this.props;
    this.props.history.push( `/story/${id}/section/${sectionId}` );
  }

  submitMultiResources = ( files ) => {
    this.props.actions.setUploadStatus( {
      status: 'initializing',
      errors: []
    } );
    setTimeout( () => {
      const { setErrorMessage } = this.props.actions;
      if ( files.length > maxBatchNumber ) {
        setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: 'Too many files uploaded' } );
        this.props.actions.setUploadStatus( undefined );
        return;
      }
      const validFiles = validateFiles( files );
      if ( validFiles.length === 0 ) {
        setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: 'No valid files to upload' } );
        this.props.actions.setUploadStatus( undefined );
        return;
      }
      if ( validFiles.length < files.length ) {
        const invalidFiles = files.filter( ( f ) => validFiles.find( ( oF ) => oF.name === f.name ) === undefined );
        this.props.actions.setUploadStatus( {
          ...this.props.uploadStatus,
          errors: invalidFiles.map( ( file ) => ( {
            fileName: file.name,
            reason: 'too big'
          } ) )
        } );
        setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: 'Some files larger than maximum size' } );
      }
      const errors = [];
      validFiles.reduce( ( curr, next ) => {
        return curr.then( () => {
          this.props.actions.setUploadStatus( {
            status: 'uploading',
            currentFileName: next.name,
            errors: this.props.uploadStatus.errors
          } );
          return createResourceData( next, this.props )
          .then( ( res ) => {
            if ( res && !res.success ) errors.push( res );
          } );
        } );
      }, Promise.resolve() )
      .then( () => {
        if ( errors.length > 0 ) {
          setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error: errors } );
        }
        // this.props.actions.setMainColumnMode('edition');
        this.props.actions.setUploadStatus( undefined );
      } )
      .catch( ( error ) => {
        this.props.actions.setUploadStatus( undefined );
        setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error } );
      } );
    }, SHORT_TIMEOUT );

  }

  onSummonAsset = ( contentId, resourceId ) => summonAsset( contentId, resourceId, this.props );

  updateSectionRawContent = ( editorStateId ) => {
    const {
      match: {
        params: {
          storyId,
          sectionId,
        }
      },
      userId,
    } = this.props;
    const section = this.props.editedStory.sections[sectionId];
    const finalEditorStateId = editorStateId === sectionId ? 'main' : editorStateId;
    const finalEditorState = this.props.editorStates[editorStateId];

    /*
     * as the function is debounced it would be possible
     * not to have access to the final editor state
     */
    if ( !finalEditorState ) {
      return;
    }
    const rawContents = convertToRaw( finalEditorState.getCurrentContent() );

    /**
     * Note the following lines are not done in the right way (the ...rest way)
     * because rawContents was not updated properly.
     * @todo investigate that
     */
    const newSection = {
      ...section,
      // contents: rawContent
    };
    // this.props.update(this.state.editorState);
    if ( finalEditorStateId === 'main' ) {

      /*
       * newSection = {
       *   ...section,
       *   contents: rawContent
       * };
       */
      newSection.contents = rawContents;
    }
    else if ( newSection.notes[editorStateId] && newSection.notes[editorStateId].contents ) {
      newSection.notes[editorStateId].contents = rawContents;

      /*
       * newSection = {
       *   ...section,
       *   notes: {
       *     ...section.notes,
       *     [editorStateId]: {
       *       ...section.notes[editorStateId],
       *       contents: rawContent
       *     }
       *   }
       * };
       */
    }
 else {
      console.warn( 'could not update editor %s', editorStateId );/* eslint no-console: 0 */
    }

    this.props.actions.updateSection( {
      storyId,
      userId,
      sectionId,
      section: newSection,
    } );
  }

  onCreateHyperlink = ( { title, url }, contentId, selection ) => {
    const {
      match: {
        params: {
          storyId,
          sectionId,
        }
      },
      userId,
      actions: {
        createResource,
      }
    } = this.props;
    const editorStateId = contentId === 'main' ? sectionId : contentId;
    if ( selection ) {
      let editorState = this.props.editorStates[editorStateId];
      editorState = EditorState.acceptSelection( editorState, selection );
      this.props.actions.updateDraftEditorState( editorStateId, editorState );
    }
    const id = genId();
    const resource = {
      ...createDefaultResource(),
      id,
      metadata: {
        type: 'webpage',
        createdAt: new Date().getTime(),
        lastModifiedAt: new Date().getTime(),
        title,
      },
      data: {
        url,
      }
    };
    createResource( {
      resourceId: id,
      storyId,
      userId,
      resource
    }, ( err ) => {
      if ( !err ) {
        this.onContextualizeHyperlink( id, contentId, this.props.editorStates[editorStateId].getSelection() );
      }
    } );
  }
  onCreateGlossary = ( { name, description }, contentId, selection ) => {
    const {
      match: {
        params: {
          storyId,
          sectionId,
        }
      },
      userId,
      actions: {
        createResource,
      }
    } = this.props;
    const editorStateId = contentId === 'main' ? sectionId : contentId;
    if ( selection ) {
      let editorState = this.props.editorStates[editorStateId];
      editorState = EditorState.acceptSelection( editorState, selection );
      this.props.actions.updateDraftEditorState( editorStateId, editorState );
    }
    const id = genId();
    const resource = {
      ...createDefaultResource(),
      id,
      metadata: {
        type: 'glossary',
        createdAt: new Date().getTime(),
        lastModifiedAt: new Date().getTime(),
      },
      data: {
        name,
        description,
      }
    };
    createResource( {
      resourceId: id,
      storyId,
      userId,
      resource
    }, ( err ) => {
      if ( !err ) {
        this.onContextualizeGlossary( id, contentId, this.props.editorStates[editorStateId].getSelection() );
      }
    } );
  }

  onCreateInternalLink = ( { contentId, selection, selectedSectionId } ) => {
    const {
      match: {
        params: {
          // storyId,
          sectionId,
        }
      },
      // userId,
      actions: {
        // createResource,
      }
    } = this.props;
    const editorStateId = contentId === 'main' ? sectionId : contentId;
    let editorState = this.props.editorStates[editorStateId];
    let selectionState = editorState.getSelection();
    if ( selection ) {
      editorState = EditorState.acceptSelection( editorState, selection );
      selectionState = selection;
      this.props.actions.updateDraftEditorState( editorStateId, editorState );
    }
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'SECTION_POINTER',
      'MUTABLE',
      { sectionId: selectedSectionId }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const contentStateWithLink = Modifier.applyEntity(
      contentStateWithEntity,
      selectionState,
      entityKey
    );
    const newEditorState = EditorState.push( editorState, contentStateWithLink );
    this.props.actions.updateDraftEditorState( editorStateId, newEditorState );
    this.props.actions.setInternalLinkModalFocusData( undefined );
    setTimeout( () => {
      this.updateSectionRawContent( editorStateId, this.props.editorStates[editorStateId] );
    } );
  }

  onContextualizeHyperlink = ( resourceId, contentId, selection ) => {
    const {
      match: {
        params: {
          sectionId,
        }
      },
    } = this.props;
    const editorStateId = contentId === 'main' ? sectionId : contentId;
    if ( selection ) {
      let editorState = this.props.editorStates[editorStateId];
      editorState = EditorState.acceptSelection( editorState, selection );
      this.props.actions.updateDraftEditorState( editorStateId, editorState );
    }
    setTimeout( () => {
      this.onSummonAsset( contentId, resourceId );
      this.props.actions.setLinkModalFocusData( undefined );
      this.props.actions.setInternalLinkModalFocusData( undefined );
    } );
  }

  onContextualizeGlossary = ( resourceId, contentId, selection ) => {
    const {
      match: {
        params: {
          sectionId,
        }
      },
    } = this.props;
    const editorStateId = contentId === 'main' ? sectionId : contentId;
    if ( selection ) {
      let editorState = this.props.editorStates[editorStateId];
      editorState = EditorState.acceptSelection( editorState, selection );
      this.props.actions.updateDraftEditorState( editorStateId, editorState );
    }
    setTimeout( () => {
      this.onSummonAsset( contentId, resourceId );
      this.props.actions.setLinkModalFocusData( undefined );
      this.props.actions.setInternalLinkModalFocusData( undefined );
      this.props.actions.setGlossaryModalFocusData( undefined );
    } );
  }

  embedLastResource = () => {
    const resources = this.props.editedStory.resources;
    const resourcesMap = Object.keys( resources ).map( ( id ) => resources[id] );
    const lastResource = resourcesMap.sort( ( a, b ) => {
      if ( a.lastUpdateAt > b.lastUpdateAt ) {
        return -1;
      }
      else {
        return 1;
      }
    } )[0];
    if ( lastResource ) {
      this.onSummonAsset( this.props.assetRequestState.editorId, lastResource.id );
    }
  }

  onResourceEditAttempt = ( resourceId ) => {
    const {
      match: {
        params: {
          storyId
        }
      },
      lockingMap,
      userId
    } = this.props;
    const userLockedResourceId = getUserResourceLockId( lockingMap, userId, storyId );
    if ( userLockedResourceId !== resourceId ) {
      this.props.actions.setEditorFocus( undefined );
      setTimeout( () => this.props.actions.setSelectedContextualizationId( undefined ) );
      this.props.actions.enterBlock( {
        storyId,
        userId,
        blockType: 'resources',
        blockId: resourceId
      } );
    }
  };

  render() {
    const {
      props: {
        editedStory,
        uploadStatus,
        match: {
          params: {
            sectionId,
            storyId,
          }
        },
        editorPastingStatus,
      },
      goToSection,
      onSummonAsset,
      onContextualizeHyperlink,
      onContextualizeGlossary,
      onCreateHyperlink,
      onCreateGlossary,
      onCreateInternalLink,
      submitMultiResources,
      embedLastResource,
      onResourceEditAttempt,
      getInactiveSections,
    } = this;

    if ( editedStory ) {
      const section = editedStory.sections[sectionId];
      if ( section ) {
        return (
          <DataUrlProvider
            storyId={ storyId }
            serverUrl={ config.apiUrl }
          >
            <EditionUiWrapper withLargeHeader>
              <SectionViewLayout
                section={ section }
                goToSection={ goToSection }
                story={ this.props.editedStory }
                embedLastResource={ embedLastResource }
                summonAsset={ onSummonAsset }
                submitMultiResources={ submitMultiResources }
                onCreateHyperlink={ onCreateHyperlink }
                onCreateInternalLink={ onCreateInternalLink }
                onCreateGlossary={ onCreateGlossary }
                onContextualizeHyperlink={ onContextualizeHyperlink }
                onContextualizeGlossary={ onContextualizeGlossary }
                onResourceEditAttempt={ onResourceEditAttempt }
                inactiveSections={ getInactiveSections() }
                { ...this.props }
              />
              <PastingModal editorPastingStatus={ editorPastingStatus } />
              <UploadModal uploadStatus={ uploadStatus } />
            </EditionUiWrapper>
          </DataUrlProvider>
        );
      }
      else return <div>Section does not exist</div>;
    }
    return null;
  }
}

export default withRouter( SectionViewContainer );
