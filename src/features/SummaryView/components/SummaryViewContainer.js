import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import AuthWrapper from '../../AuthManager/components/AuthManagerContainer';

import SummaryViewLayout from './SummaryViewLayout';

import * as editedStoryDuck from '../../StoryManager/duck';

@connect(
  state => ({
    ...editedStoryDuck.selector(state.editedStory),
  }),
  dispatch => ({
    actions: bindActionCreators({
    }, dispatch)
  })
)
class SummaryViewContainer extends Component {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate = () => true;

  render() {
    return this.props.editedStory ? (
      <AuthWrapper>
        <SummaryViewLayout
          {...this.props} />
      </AuthWrapper>
    ) : null;
  }
}

export default SummaryViewContainer;
