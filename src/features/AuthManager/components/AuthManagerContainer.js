import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import {loadStoryToken, saveStoryToken} from '../../../helpers/localStorageUtils';

import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as storyDuck from '../../StoryManager/duck';
import * as duck from '../duck';

import AuthManagerLayout from './AuthManagerLayout';

@connect(
  state => ({
    ...connectionsDuck.selector(state.connections),
    ...duck.selector(state.auth),
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...connectionsDuck,
      ...storyDuck,
      ...duck,
    }, dispatch)
  })
)
class AuthManagerContainer extends Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    /**
     * Activate story on mount
     */
    const {userId} = this.props;
    const {storyId} = this.props.match.params;
    this.activateStory(storyId, userId);
  }

  componentWillReceiveProps = nextProps => {
    /**
     * If story id is changed (through direct URL change for instance)
     * leave previous story and login to next story
     */
    const {
      match: {
        params: {
          storyId: prevStoryId
        }
      },
    } = this.props;
    const {
      match: {
        params: {
          storyId: nextStoryId
        }
      },
      userId,
    } = nextProps;
    if (prevStoryId !== nextStoryId) {
      this.props.actions.leaveStory({prevStoryId, userId});
      this.activateStory(nextStoryId, userId);
    }

    /**
     * If locking map gets empty it is abnormal (e.g. server restarted)
     * so the whole lock system is not working anymore
     * so we redirect client to the home
     */
    if (Object.keys(this.props.lockingMap).length > 0 && Object.keys(nextProps.lockingMap).length === 0) {
      this.props.history.push('/');
    }
  }

  componentWillUnmount() {
    /**
     * Desactive story on unmount (giving the server the opportunity to unload story if no one else is editing it)
     */
    const {userId} = this.props;
    const {storyId} = this.props.match.params;
    this.props.actions.leaveStory({storyId, userId});
  }

  /**
   * Activate a story by sending a request to the socket
   * and handle login process if the client is not authenticated
   * @param storyId {string}
   * @param userId {string}
   */
  activateStory = (storyId, userId) => {
    const token = loadStoryToken(storyId);
    this.props.actions.activateStory({storyId, userId, token})
    .then((res) => {
      if (res.error && res.error.response && res.error.response.data && res.error.response.data.auth === false) {
        this.props.actions.setStoryLoginId(storyId);
      }
    });
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
        <AuthManagerLayout
          {...this.props}
          saveStoryToken={saveStoryToken} />
      </div>
    );
  }
}

export default withRouter(AuthManagerContainer);
