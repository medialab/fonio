/**
 * This module provides a connected component for handling error-related UI
 * @module fonio/features/ErrorMessage
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import approveBrowser from 'approved-browser';
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';
import { withRouter } from 'react-router';
import {
  ModalCard
} from 'quinoa-design-library/components';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { getBrowserInfo } from '../../../helpers/misc';

/**
 * Imports Ducks
 */
import * as duck from '../duck';
import * as storyDuck from '../../StoryManager/duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';
import { setStoryLoginId } from '../../AuthManager/duck';
import {
  FETCH_STORIES,
  CREATE_STORY,
  OVERRIDE_STORY,
  IMPORT_STORY,
  DUPLICATE_STORY,
  DELETE_STORY,
  CHANGE_PASSWORD
} from '../../HomeView/duck';
import {
  ACTIVATE_STORY,
  UPLOAD_RESOURCE,
  DELETE_UPLOADED_RESOURCE,
  DELETE_SECTION,
  DELETE_RESOURCE,
  SAVE_STORY,
} from '../../StoryManager/duck';

/**
 * Shared variables
 */
const ACCEPTED_BROWSERS = {
  Chrome: 50,
  Firefox: 50,
  strict: true
};

@withRouter
@connect(
  ( state ) => ( {
    ...duck.selector( state.errorMessage ),
    ...storyDuck.selector( state.editedStory ),
    ...connectionsDuck.selector( state.connections ),
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      ...duck,
      setStoryLoginId,
    }, dispatch )
  } )
)
class ErrorMessageContainer extends Component {

  static contextTypes = {
    t: PropTypes.func,
    store: PropTypes.object,
  }

  constructor( props ) {
    super( props );
  }

  componentDidMount = () => {
    const browserInfo = getBrowserInfo();
    approveBrowser( ACCEPTED_BROWSERS, ( approved ) => {
      if ( !approved ) {
        this.props.actions.setBrowserWarning( browserInfo );
      }
    } );
  }

  componentWillReceiveProps = ( nextProps ) => {
    const translate = translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' );

    if ( this.props.lastErrorMessage !== nextProps.lastErrorMessage ) {
      if ( nextProps.lastErrorMessage === 'invalid token' ) {
        const redirectTo = nextProps.editedStory ?
          `/story/${nextProps.editedStory.id}`
          :
          '/';
        nextProps.history.push( redirectTo );
        nextProps.actions.setStoryLoginId( nextProps.editedStory && nextProps.editedStory.id );
        toastr.error( translate( 'Your story access token is expired' ) );

      }
    }

    if ( this.props.lastLockFail !== nextProps.lastLockFail ) {
      let title;
      if ( nextProps.lastLockFail && nextProps.lastLockFail.mode === 'enter' ) {
        switch ( nextProps.lastLockFail.blockType ) {
          case 'sections':
            title = translate( 'You could not edit a section' );
            break;
          case 'resources':
            title = translate( 'You could not edit the resource' );
            break;
          case 'storyMetadata':
            title = translate( 'You could not edit story metadata' );
            break;
          case 'sectionsOrder':
            title = translate( 'You could not edit the order of sections' );
            break;
          case 'design':
            title = translate( 'You could not edit the story design' );
            break;
          default:
            title = translate( 'You could not edit a block' );
            break;
        }
      }
      if ( nextProps.lastLockFail && nextProps.lastLockFail.mode === 'delete' ) {
        switch ( nextProps.lastLockFail.blockType ) {
          case 'sections':
            title = translate( 'You could not delete a section' );
            break;
          case 'resources':
            title = translate( 'You could not delete a resource' );
            break;
          default:
            title = translate( 'You could not delete a block' );
            break;
        }
      }
      // toastr.error(title);
      if ( nextProps.editedStory && nextProps.lockingMap[nextProps.editedStory.id] ) {
        const lockedUsers = nextProps.lockingMap[nextProps.editedStory.id].locks;
        const lockedUserId = Object.keys( lockedUsers ).find(
            ( thatUserId ) => lockedUsers[thatUserId][nextProps.lastLockFail.blockType] &&
                          lockedUsers[thatUserId][nextProps.lastLockFail.blockType].blockId === nextProps.lastLockFail.blockId
          );
        const lockedUser = lockedUserId && nextProps.activeUsers[lockedUserId];
        if ( lockedUser ) {
          const message = translate( 'It is edited by {a}', { a: lockedUser && lockedUser.name } );
          toastr.error( title, message );
        }
      }
    }
    else if ( nextProps.requestFail !== this.props.requestFail || nextProps.lastErrorTime !== this.props.lastErrorTime ) {
      const message = this.messages[nextProps.requestFail] || {
        title: () => nextProps.requestFail
      };
      toastr.error( message.title( nextProps.lastError ), message.details && message.details( nextProps.lastError ) );
    }
  }

  componentWillUnmount = () => {
    this.props.actions.clearErrorMessages( false );
  }

  messages = {
    [`${'SUBMIT_MULTI_RESOURCES_FAIL'}`]: {
      title: () => {
        const translate = translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' );
        return translate( 'Upload went wrong' );
      },
      details: ( payload ) => {
        const translate = translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' );
        switch ( payload.error ) {
          case 'Too many files uploaded':
            return translate( 'You tried to upload too many files at the same time. ' ) + translate( 'Please split your uploads in smaller groups !' );
          case 'Files extends maximum size to upload':
            return translate( 'The total length of the files you tried to upload extends maximum size to upload. ' ) + translate( 'Please split your uploads in smaller groups !' );
          case 'No valid files to upload':
            return translate( 'No valid files to upload, your files are either too big or not in the right format.' );
          case 'Some files larger than maximum size':
            return translate( 'Some files are larger than the maximum file size allowed, they were not added to the library.' );
          default:
            return undefined;
        }
      }
    },
    [`${'UPDATE_SECTION_FAIL'}`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The section could not be updated with your last changes' )
    },
    [`${'CREATE_CONTEXTUALIZATION_NOTE_FAIL'}`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'This type of item cannot be added into note' )
    },
    [`${FETCH_STORIES}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The list of stories could not be retrieved' )
    },
    [`${CREATE_STORY}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The story could not be created' )
    },
    [`${SAVE_STORY}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The story could not be saved' )
    },
    [`${OVERRIDE_STORY}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The story could not be overriden' )
    },
    [`${IMPORT_STORY}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The story could not be imported' ),
      details: ( payload = {} ) => {
        switch ( payload.error ) {
          case 'malformed json':
            return translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The file format (JSON) of the imported story is not valid.' );
          case 'file is too large':
            return translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'Your story file is larger than maximum file size allowed' );
          default:
            return undefined;
        }
      }
    },
    [`${DUPLICATE_STORY}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The story could not be duplicated' )
    },
    [`${DELETE_STORY}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The story could not be deleted' )
    },
    [`${CHANGE_PASSWORD}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The password could not be changed' )
    },
    [`${ACTIVATE_STORY}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'The story could not be opened' )
    },
    [`${UPLOAD_RESOURCE}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'An item could not be uploaded' ),
      details: ( payload ) => {
        const fileName = payload.resource && payload.resource.metadata &&
          `${payload.resource.metadata.title}.${payload.resource.metadata.ext}`;
        return translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( '{n} is too big', { n: fileName } );
      }
    },
    [`${DELETE_UPLOADED_RESOURCE}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'An item could not be deleted' )
    },
    [`${DELETE_SECTION}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'A section could not be deleted' )
    },
    [`${DELETE_RESOURCE}_FAIL`]: {
      title: () => translateNameSpacer( this.context.t, 'Features.ErrorMessageContainer' )( 'An item could not be deleted' )
    }
  }

  render() {

    /**
     * Variables definition
     */
    const {
      props: {
        children,
        needsReload,
        connectError,
        // lastError,
        malformedStoryError,
        browserWarning,
        actions: {
          setBrowserWarning
        }
      },
      context: { t }
    } = this;

    /**
     * Computed variables
     */
    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Features.ErrorMessageContainer' );

    /**
     * Callbacks handlers
     */
    const handleCloseBrowserWarning = () => setBrowserWarning( undefined );

    return (
      <div>
        {!connectError && children}
        <ModalCard
          isActive={ needsReload }
          headerContent={ translate( 'Something went wrong' ) }
          mainContent={
            <div>
              <p>
                {translate( 'An error happened, sorry. Please reload this page to continue editing!' )}
              </p>
              <p>
                {translate( 'Would you be kind enough to report what happened before this screen ' )}
                <a
                  target={ 'blank' }
                  href={ 'https://docs.google.com/forms/d/e/1FAIpQLSfbo6ShhqQeSdZxnuBvqyskVGiC3NKbdyPpIFL1SIA04wkmZA/viewform?usp=sf_link' }
                >
                  {translate( 'in this page' )}
                </a> ?
              </p>
            </div>
          }
        />
        <ModalCard
          isActive={ malformedStoryError }
          headerContent={ translate( 'Something went wrong' ) }
          mainContent={
            <div>
              <p>
                {translate( 'An error happened, sorry. It seems that the story you are trying to access is corrupted.' )}
              </p>
              <p>
                {translate( 'Please contact your teachers so that a backup version of this story is reset.' )}
                <a
                  target={ 'blank' }
                  href={ '/' }
                >
                  {translate( 'Come back to classroom home' )}
                </a> ?
              </p>
            </div>
          }
        />
        <ModalCard
          isActive={ connectError }
          headerContent={ translate( 'Fonio - Something is wrong' ) }
          mainContent={
            <div>
              <p>
                {translate( 'You cannot connect to your classroom server.' )}
              </p>
              <p>
                {translate( 'Please check your internet connection or contact your teacher' )}.
              </p>
            </div>
          }
        />
        <ModalCard
          isActive={ browserWarning }
          headerContent={ translate( 'Your browser is not supported' ) }
          onClose={ handleCloseBrowserWarning }
          mainContent={
            <div>
              <p>
                {translate( 'You are using {b} version {v} which was not tested for fonio.', { b: browserWarning && browserWarning.name, v: browserWarning && browserWarning.version } )}
              </p>
              <p>
                {translate( 'Please download the last version of firefox or chrome or use this tool at your risks !' )}
              </p>
            </div>
          }
        />
      </div>
    );
  }
}

export default ErrorMessageContainer;
