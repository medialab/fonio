/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the story settings manager interface
 * @module fonio/features/StorySettingsManager
 */
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import StorySettingsManagerLayout from './StorySettingsManagerLayout';
import * as duck from '../duck';
import * as storiesManagerDuck from '../../StoriesManager/duck';

/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.storySettingsManager),
    ...storiesManagerDuck.selector(state.stories),
    lang: state.i18nState.lang,
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
    }, dispatch)
  })
)
class StorySettingsManagerContainer extends Component {

  static contextTypes = {
    t: React.PropTypes.func.isRequired,
    store: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (!this.props.citationStylesList || !this.props.citationStylesList.length) {
      this.props.actions.getCitationStylesList();
    }
    if (!this.props.citationLocalesList || !this.props.citationLocalesList.length) {
      this.props.actions.getCitationLocalesList();
    }
  }

  shouldComponentUpdate() {
    return true;
  }
  render() {
    return (
      <StorySettingsManagerLayout
        {...this.props} />
    );
  }
}

export default StorySettingsManagerContainer;
