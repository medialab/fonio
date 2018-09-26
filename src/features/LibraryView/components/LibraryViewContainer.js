/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Imports Project utils
 */
import { createResourceData, validateFiles } from '../../../helpers/resourcesUtils';

/**
 * Import Ducks
 */
import * as duck from '../duck';
import * as editedStoryDuck from '../../StoryManager/duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as sectionsManagementDuck from '../../SectionsManager/duck';
import * as errorMessageDuck from '../../ErrorMessageManager/duck';
import * as editionUiDuck from '../../EditionUiWrapper/duck';

/**
 * Imports Components
 */
import LibraryViewLayout from './LibraryViewLayout';
import EditionUiWrapper from '../../EditionUiWrapper/components';
import DataUrlProvider from '../../../components/DataUrlProvider';
import UploadModal from '../../../components/UploadModal';

/**
 * Imports Assets
 */
import config from '../../../config';

/**
 * Shared variables
 */
const { maxBatchNumber } = config;

@connect(
  ( state ) => ( {
    ...duck.selector( state.library ),
    ...editedStoryDuck.selector( state.editedStory ),
    ...connectionsDuck.selector( state.connections ),
    ...sectionsManagementDuck.selector( state.sectionsManagement ),
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      ...editionUiDuck,
      ...connectionsDuck,
      ...editedStoryDuck,
      ...sectionsManagementDuck,
      ...errorMessageDuck,
      ...duck
    }, dispatch )
  } )
)
class LibraryViewContainer extends Component {

  constructor( props ) {
    super( props );
  }

  shouldComponentUpdate = () => true;

  /**
   * Leave locked blocks when leaving the view
   */
  componentWillUnmount = () => {
    this.leaveLockedBlocks();
    this.props.actions.resetViewsUi();
  }

  leaveLockedBlocks = () => {
    const {
      userId,
      editedStory: story,
      lockingMap = {},
      actions: {
        leaveBlock
      }
    } = this.props;
    const {
      id: storyId
    } = story;

    const locks = lockingMap[storyId] && lockingMap[storyId].locks || {};
    const userLocks = locks[userId];

    if ( userLocks && userLocks.resources ) {
      leaveBlock( {
        storyId,
        userId,
        blockType: 'resources',
        blockId: userLocks.resources.blockId
      } );
    }
  }

  /**
   * @todo refactor this redundant cont with SectionViewContainer
   */
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
        this.props.actions.setMainColumnMode( 'edition' );
        this.props.actions.setUploadStatus( undefined );
      } )
      .catch( ( error ) => {
        this.props.actions.setUploadStatus( undefined );
        setErrorMessage( { type: 'SUBMIT_MULTI_RESOURCES_FAIL', error } );
      } );
    }, 100 );
  }

  render() {
    const {
      props: {
        uploadStatus,
        editedStory,
      },
      submitMultiResources
    } = this;
    return editedStory ?
          (
            <DataUrlProvider
              storyId={ editedStory.id }
              serverUrl={ config.apiUrl }
            >
              <EditionUiWrapper>
                <LibraryViewLayout
                  { ...this.props }
                  submitMultiResources={ submitMultiResources }
                />

                <UploadModal uploadStatus={ uploadStatus } />
              </EditionUiWrapper>
            </DataUrlProvider>
          )
          : null;
  }
}

export default LibraryViewContainer;
