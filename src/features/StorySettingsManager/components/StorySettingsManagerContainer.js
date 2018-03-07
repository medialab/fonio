/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the story settings manager interface
 * @module fonio/features/StorySettingsManager
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import StorySettingsManagerLayout from './StorySettingsManagerLayout';
import * as duck from '../duck';
import * as storiesManagerDuck from '../../StoriesManager/duck';
import * as globalDuck from '../../GlobalUi/duck';


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
      ...globalDuck,
      ...duck,
    }, dispatch)
  })
)
class StorySettingsManagerContainer extends Component {

  /**
   * Context data used by the component
   */
  static contextTypes = {

    /**
     * Un-namespaced translate function
     */
    t: PropTypes.func.isRequired,

    /**
     * Redux store
     */
    store: PropTypes.object.isRequired
  }

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
  }


  /**
   * Executes code just after the component was mounted
   */
  componentDidMount() {
    if (!this.props.citationStylesList || !this.props.citationStylesList.length) {
      this.props.actions.getCitationStylesList();
    }
    if (!this.props.citationLocalesList || !this.props.citationLocalesList.length) {
      this.props.actions.getCitationLocalesList();
    }
  }


  /**
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @param {object} nextState - the state to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate() {
    // todo: optimize that when the feature is stabilized
    return true;
  }

  /**
   * Opens active story settings
   */
  openSettings = () => {
    this.props.actions.startStoryCandidateConfiguration(this.props.activeStory);
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    return (
      <StorySettingsManagerLayout
        openSettings={this.openSettings}
        {...this.props} />
    );
  }
}

export default StorySettingsManagerContainer;
