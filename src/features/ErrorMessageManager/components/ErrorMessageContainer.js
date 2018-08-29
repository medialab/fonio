import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import {connect} from 'react-redux';
import {toastr} from 'react-redux-toastr';

import {
  ModalCard
} from 'quinoa-design-library/components';

import {translateNameSpacer} from '../../../helpers/translateUtils';
import {getBrowserInfo} from '../../../helpers/misc';

import * as duck from '../duck';
import * as storyDuck from '../../StoryManager/duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';

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
  DELETE_RESOURCE
} from '../../StoryManager/duck';

const ACCEPTED_BROWSERS = [
{
  id: 'Chrome',
  version: 50
},
{
  id: 'Firefox',
  version: 50
}];


@connect(
  state => ({
    ...duck.selector(state.errorMessage),
    ...storyDuck.selector(state.editedStory),
    ...connectionsDuck.selector(state.connections),
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
    }, dispatch)
  })
)
class ErrorMessageContainer extends Component {

  static contextTypes = {
    t: PropTypes.func,
    store: PropTypes.object,
  }

  constructor(props, context) {
    super(props);
    this.translate = translateNameSpacer(context.t, 'Features.ErrorMessageContainer');
  }

  componentDidMount = () => {
    const browserInfo = getBrowserInfo();
    const accepted = browserInfo.name !== undefined && browserInfo.version !== undefined && ACCEPTED_BROWSERS.find(browser => browserInfo.name === browser.id && +browserInfo.version >= browser.version);
    if (!accepted) {
      this.props.actions.setBrowserWarning(browserInfo);
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const translate = translateNameSpacer(this.context.t, 'Features.ErrorMessageContainer');


    if (this.props.lastLockFail !== nextProps.lastLockFail) {

      let title;
      if (nextProps.lastLockFail.mode === 'enter') {
        switch (nextProps.lastLockFail.blockType) {
          case 'sections':
            title = translate('You could not edit a section');
            break;
          case 'resources':
            title = translate('You could not edit the resource');
            break;
          case 'storyMetadata':
            title = translate('You could not edit story metadata');
            break;
          case 'sectionsOrder':
            title = translate('You could not edit the order of sections');
            break;
          case 'design':
            title = translate('You could not edit the story design');
            break;
          default:
            title = translate('You could not edit a block');
            break;
        }
      }
      if (nextProps.lastLockFail.mode === 'delete') {
        switch (nextProps.lastLockFail.blockType) {
          case 'sections':
            title = translate('You could not delete a section');
            break;
          case 'resources':
            title = translate('You could not delete a resource');
            break;
          default:
            title = translate('You could not delete a block');
            break;
        }
      }
      // toastr.error(title);
      if (nextProps.editedStory && nextProps.lockingMap[nextProps.editedStory.id]) {
        const lockedUsers = nextProps.lockingMap[nextProps.editedStory.id].locks;
        const lockedUserId = Object.keys(lockedUsers).find(
            thatUserId => lockedUsers[thatUserId][nextProps.lastLockFail.blockType] &&
                          lockedUsers[thatUserId][nextProps.lastLockFail.blockType].blockId === nextProps.lastLockFail.blockId
          );
        const lockedUser = lockedUserId && nextProps.activeUsers[lockedUserId];
        if (lockedUser) {
          const message = translate('It is edited by {a}', {a: lockedUser && lockedUser.name});
          toastr.error(title, message);
        }
      }
    }
    else if (nextProps.requestFail !== this.props.requestFail || nextProps.lastErrorTime !== this.props.lastErrorTime) {
      const message = this.messages[nextProps.requestFail] || {
        title: () => nextProps.requestFail
      };
      toastr.error(message.title(nextProps.lastError), message.details && message.details(nextProps.lastError));
    }
  }

  componentWillUnmount = () => {
    this.props.actions.clearErrorMessages(false);
  }

  messages = {
    [`${'SUBMIT_MULTI_RESOURCES_FAIL'}`]: {
      title: () => {
        return this.translate('Upload went wrong');
      },
      details: (payload) => {
        switch (payload.error) {
          case 'Too many files uploaded':
            return this.translate('You tried to upload too many files at the same time. ') + this.translate('Please split your uploads in smaller groups !');
          case 'Files extends maximum size to upload':
            return this.translate('The total length of the files you tried to upload extends maximum size to upload. ') + this.translate('Please split your uploads in smaller groups !');
          case 'No valid files to upload':
            return this.translate('No valid files to upload, your files are either too big or not in the right format.');
          case 'Some files larger than maximum file size':
            return this.translate('Some files are larger than the maximum file size allowed, they were not added to the library.');
          default:
            return undefined;
        }
      }
    },
    [`${'UPDATE_SECTION_FAIL'}`]: {
      title: () => this.translate('The section could not be updated with your last changes')
    },
    [`${'CREATE_CONTEXTUALIZATION_NOTE_FAIL'}`]: {
      title: () => this.translate('This asset could not be added into note')
    },
    [`${FETCH_STORIES}_FAIL`]: {
      title: () => this.translate('The list of stories could not be retrieved')
    },
    [`${CREATE_STORY}_FAIL`]: {
      title: () => this.translate('The story could not be created')
    },
    [`${OVERRIDE_STORY}_FAIL`]: {
      title: () => this.translate('The story could not be overriden')
    },
    [`${IMPORT_STORY}_FAIL`]: {
      title: () => this.translate('The story could not be imported')
    },
    [`${DUPLICATE_STORY}_FAIL`]: {
      title: () => this.translate('The story could not be duplicated')
    },
    [`${DELETE_STORY}_FAIL`]: {
      title: () => this.translate('The story could not be deleted')
    },
    [`${CHANGE_PASSWORD}_FAIL`]: {
      title: () => this.translate('The password could not be changed')
    },
    [`${ACTIVATE_STORY}_FAIL`]: {
      title: () => this.translate('The story could not be opened')
    },
    [`${UPLOAD_RESOURCE}_FAIL`]: {
      title: () => this.translate('An item could not be uploaded'),
      details: (payload) => {
        const fileName = payload.resource && payload.resource.metadata &&
          `${payload.resource.metadata.title}.${payload.resource.metadata.ext}`;
        return this.translate('{n} is too big', {n: fileName});
      }
    },
    [`${DELETE_UPLOADED_RESOURCE}_FAIL`]: {
      title: () => this.translate('An item could not be deleted')
    },
    [`${DELETE_SECTION}_FAIL`]: {
      title: () => this.translate('A section could not be deleted')
    },
    [`${DELETE_RESOURCE}_FAIL`]: {
      title: () => this.translate('An item could not be deleted')
    }
  }


  render() {
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
      context: {t}
    } = this;
    const translate = translateNameSpacer(t, 'Features.ErrorMessageContainer');
    return (
      <div>
        {!connectError && children}
        <ModalCard
          isActive={needsReload}
          headerContent={translate('Something went wrong')}
          mainContent={
            <div>
              <p>
                {translate('An error happened, sorry. Please reload this page to continue editing!')}
              </p>
              <p>
                {translate('Would you be kind enough to report what happened before this screen ')}
                <a
                  target="blank"
                  href={
                    'https://docs.google.com/forms/d/e/1FAIpQLSfbo6ShhqQeSdZxnuBvqyskVGiC3NKbdyPpIFL1SIA04wkmZA/viewform?usp=sf_link'
                   // `https://github.com/medialab/fonio/issues/new?title=save+story+failed&body=${encodeURIComponent('My editor failed to save story with error message:\n```\n' + JSON.stringify(lastError) + '\n```\n\nJust before that, here is what I was doing:\n\n')}`
                  }>
                  {translate('in this page')}
                </a> ?
              </p>
            </div>
          } />
        <ModalCard
          isActive={malformedStoryError}
          headerContent={translate('Something went wrong')}
          mainContent={
            <div>
              <p>
                {translate('An error happened, sorry. It seems that the story you are trying to access is corrupted.')}
              </p>
              <p>
                {translate('Please contact your teachers so that a backup version of this story is reset.')}
                <a
                  target="blank"
                  href={'/'}>
                  {translate('Come back to classroom home')}
                </a> ?
              </p>
            </div>
          } />
        <ModalCard
          isActive={connectError}
          headerContent={translate('Fonio - Something is wrong')}
          mainContent={
            <div>
              <p>
                {translate('You cannot connect to your classroom server.')}
              </p>
              <p>
                {translate('Please check your internet connection or contact your teacher')}.
              </p>
            </div>
          } />
        <ModalCard
          isActive={browserWarning}
          headerContent={translate('Your browser is not supported')}
          onClose={() => setBrowserWarning(undefined)}
          mainContent={
            <div>
              <p>
                {translate('You are using {b} version {v} which was not tested for fonio.', {b: browserWarning && browserWarning.name, v: browserWarning && browserWarning.version})}
              </p>
              <p>
                {translate('Please download the last version of firefox or chrome or use this tool at your risks !')}
              </p>
            </div>
          } />
      </div>
    );
  }
}

export default ErrorMessageContainer;
