/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the configuration dialog feature interface
 * @module fonio/features/ConfigurationDialog
 */
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as duck from '../duck';
import {
  closeStoryCandidateModal,
  applyStoryCandidateConfiguration,
  setActiveStoryId
} from '../../GlobalUi/duck';

import ConfigurationDialogLayout from './ConfigurationDialogLayout';

/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.storyCandidate),
    visualizationTypesModels: state.models.visualizationTypes,
    lang: state.i18nState.lang
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      applyStoryCandidateConfiguration,
      closeStoryCandidateModal,
      setActiveStoryId
    }, dispatch)
  })
)
class ConfigurationDialogContainer extends Component {
  /**
   * constructor
   */
  constructor(props) {
    super(props);
    this.closeStoryCandidate = this.closeStoryCandidate.bind(this);
    this.closeAndSetupStoryCandidate = this.closeAndSetupStoryCandidate.bind(this);
  }

  shouldComponentUpdate() {
    return true;
  }

  closeStoryCandidate() {
    this.props.actions.resetStoryCandidateSettings();
    this.props.actions.closeStoryCandidateModal();
  }

  changeVisualizationType (type) {
    this.props.actions.resetStoryCandidateSettings();
    this.props.actions.setVisualizationType(type);
  }

  closeAndSetupStoryCandidate() {
    this.props.actions.setupStoryCandidate(this.props.dataMap, this.props.activeVisualizationType, this.props.activeData);
    this.props.actions.closeStoryCandidateModal();
  }

  render() {
    return (
      <ConfigurationDialogLayout
        {...this.props}
        closeStoryCandidate={this.closeStoryCandidate}
        closeAndSetupStoryCandidate={this.closeAndSetupStoryCandidate}
        changeVisualizationType={this.changeVisualizationType} />
    );
  }
}

export default ConfigurationDialogContainer;
