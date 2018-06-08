import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import SummaryViewLayout from './SummaryViewLayout';

import * as duck from '../duck';
import * as editedStoryDuck from '../../StoryManager/duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';

@connect(
  state => ({
    ...duck.selector(state.summary),
    ...editedStoryDuck.selector(state.editedStory),
    ...connectionsDuck.selector(state.connections),
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...connectionsDuck,
      ...duck
    }, dispatch)
  })
)
class SummaryViewContainer extends Component {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate = () => true;

  render() {
    return this.props.editedStory
      && this.props.editedStory.metadata ?
          (<SummaryViewLayout
            {...this.props} />)
          : null;
  }
}

export default SummaryViewContainer;
