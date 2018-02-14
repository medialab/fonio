/* eslint react/no-set-state: 0 */
/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the configuration dialog feature interface
 * @module fonio/features/ConfigurationDialog
 */
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';

import * as duck from '../duck';

import {
  selector as globalUiSelector,
  closeStoryCandidateModal,
  applyStoryCandidateConfiguration,
} from '../../GlobalUi/duck';

import {
  selector as storiesSelector,
  saveStory,
  createStory
} from '../../StoriesManager/duck';

import ConfigurationDialogLayout from './ConfigurationDialogLayout';


/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.storyCandidate),
    ...globalUiSelector(state.globalUi),
    ...storiesSelector(state.stories),
    visualizationTypesModels: state.models.visualizationTypes,
    lang: state.i18nState.lang
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      saveStory,
      createStory,
      applyStoryCandidateConfiguration,
      closeStoryCandidateModal,
    }, dispatch)
  })
)
class ConfigurationDialogContainer extends Component {

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
    this.closeStoryCandidate = this.closeStoryCandidate.bind(this);
    this.closeAndSetupStoryCandidate = this.closeAndSetupStoryCandidate.bind(this);
  }
  componentDidMount() {
    const {storyCandidatePassword, storyCandidate} = this.props;
    const {validateStoryCandidateSettings} = this.props.actions;
    validateStoryCandidateSettings('title', storyCandidate.metadata.title);
    validateStoryCandidateSettings('password', storyCandidatePassword);
    validateStoryCandidateSettings('authors', storyCandidate.metadata.authors);
  }

  /**
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @param {object} nextState - the state to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate() {
    // todo: optimize when the feature is stabilized
    return true;
  }


  /**
   * Both closes story settings view
   * and resets story candidate
   */
  closeStoryCandidate() {
    this.props.actions.resetStoryCandidateSettings();
    this.props.actions.closeStoryCandidateModal();
  }


  /**
   * Creates a new story candidate
   * and closes the modal.
   */
  closeAndSetupStoryCandidate() {
    this.props.actions.setupStoryCandidate(this.props.dataMap, this.props.activeVisualizationType, this.props.activeData);
    this.props.actions.closeStoryCandidateModal();
  }

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    return (
      <ConfigurationDialogLayout
        {...this.props}
        closeStoryCandidate={this.closeStoryCandidate}
        closeAndSetupStoryCandidate={this.closeAndSetupStoryCandidate} />
    );
  }
}

export default withRouter(ConfigurationDialogContainer);
