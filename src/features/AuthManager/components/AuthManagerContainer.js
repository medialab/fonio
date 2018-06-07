import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

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

  componentDidMount() {
    const {userId} = this.props;
    const {storyId} = this.props.match.params;
    const token = localStorage.getItem(storyId);
    this.props.actions.activateStory({storyId, userId, token})
    .then((res) => {
      if (res.error && res.error.response && res.error.response.data && res.error.response.data.auth === false) {
        this.props.actions.setStoryLoginId(storyId);
      }
    });
  }

  componentWillUnmount() {
    // const {userId} = this.props;
    // const {id} = this.props.match.params;
    // this.props.actions.leaveStory({storyId: id, userId});
  }

  render() {
    const {
      props: {
        children,
      }
    } = this;
    return (
      <div>
        {children}
        <AuthManagerLayout {...this.props} />
      </div>
    );
  }
}

export default withRouter(AuthManagerContainer);
