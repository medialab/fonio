import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import {connect} from 'react-redux';
import {toastr} from 'react-redux-toastr';

import {
  ModalCard
} from 'quinoa-design-library/components';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import * as duck from '../duck';
import * as storyDuck from '../../StoryManager/duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';


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

  constructor(props) {
    super(props);
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
      toastr.error(nextProps.requestFail);
    }
  }

  componentWillUnmount = () => {
    this.props.actions.clearErrorMessages(false);
  }

  render() {
    const {
      props: {
        children,
        needsReload,
        connectError,
        lastError,
        malformedStoryError,
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
                  href={`https://github.com/medialab/fonio/issues/new?title=save+story+failed&body=${encodeURIComponent('My editor failed to save story with error message:\n```\n' + JSON.stringify(lastError) + '\n```\n\nJust before that, here is what I was doing:\n\n')}`}>
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
      </div>
    );
  }
}

export default ErrorMessageContainer;
