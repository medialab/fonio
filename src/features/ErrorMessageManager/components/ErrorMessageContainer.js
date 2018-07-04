import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {connect} from 'react-redux';
import {toastr} from 'react-redux-toastr';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import * as duck from '../duck';
import * as storyDuck from '../../StoryManager/duck';


@connect(
  state => ({
    ...duck.selector(state.errorMessage),
    ...storyDuck.selector(state.editedStory),
  }),
  // dispatch => ({
  //   actions: bindActionCreators({
  //     ...duck,
  //   }, dispatch)
  // })
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
    if (nextProps.requestFail !== this.props.requestFail)
      toastr.error(nextProps.requestFail);

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
      toastr.error(title);

      // if (nextProps.editedStory) {
      //   const lockedUsers = nextProps.lockingMap[nextProps.editedStory.id].locks;
      //   const lockedUserId = Object.keys(lockedUsers).find(
      //       thatUserId => lockedUsers[thatUserId][nextProps.lastLockFail.blockType] &&
      //                     lockedUsers[thatUserId][nextProps.lastLockFail.blockType].blockId === nextProps.lastLockFail.blockId
      //     );
      //   const lockedUser = lockedUserId && nextProps.activeUsers[lockedUserId];
      //   if (lockedUser) {
      //     const message = translate('It is edited by {a}', {a: lockedUser && lockedUser.name});
      //     toastr.error(title, message);
      //   }
      // }
    }
  }

  render() {
    const {
      props: {
        children,
      },
    } = this;
    return (
      <div>
        {children}
      </div>
    );
  }
}

export default ErrorMessageContainer;
