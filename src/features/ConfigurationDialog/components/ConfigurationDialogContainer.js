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
  setActiveStoryId
} from '../../GlobalUi/duck';

import {
  selector as storiesSelector,
  saveStoryPassword,
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
      saveStoryPassword,
      applyStoryCandidateConfiguration,
      closeStoryCandidateModal,
      setActiveStoryId
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
    this.state = {
      password: undefined,
      passwordIsValid: false
    };
    this.closeStoryCandidate = this.closeStoryCandidate.bind(this);
    this.closeAndSetupStoryCandidate = this.closeAndSetupStoryCandidate.bind(this);
    this.setStoryPassword = this.setStoryPassword.bind(this);
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
   * password validation
   */
  setStoryPassword (value) {
    this.setState({
      password: value,
      passwordIsValid: value.length > 5
    });
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    return (
      <ConfigurationDialogLayout
        {...this.props}
        password={this.state.password}
        passwordIsValid={this.state.passwordIsValid}
        setStoryPassword={this.setStoryPassword}
        closeStoryCandidate={this.closeStoryCandidate}
        closeAndSetupStoryCandidate={this.closeAndSetupStoryCandidate} />
    );
  }
}

export default withRouter(ConfigurationDialogContainer);
