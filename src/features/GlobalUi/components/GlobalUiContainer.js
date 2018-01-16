/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the interface container
 * @module fonio/features/GlobalUi
 */
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {setLanguage} from 'redux-i18n';
import {v4 as genId} from 'uuid';

import GlobalUiLayout from './GlobalUiLayout';
import * as duck from '../duck';
import * as managerDuck from '../../StoriesManager/duck';
import * as editorDuck from '../../StoryEditor/duck';
import {
  selector as sectionsSelector,
  updateSection as updateSectionAction,
  createSection as createSectionAction,
  setActiveSectionId,
} from '../../SectionsManager/duck';

import {
  resetStoryCandidateSettings,
  setupStoryCandidate
} from '../../ConfigurationDialog/duck';

import {
  updateAsset,
  embedAsset,
  updateResource,
  fetchResources,
} from '../../ResourcesManager/duck';

import {
  createDefaultSection
} from '../../../helpers/modelsUtils';


/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.globalUi),
    ...managerDuck.selector(state.stories),
    ...sectionsSelector(state.sectionsManager),
    ...editorDuck.selector(state.storyEditor),
    lang: state.i18nState.lang,
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      ...managerDuck,
      resetStoryCandidateSettings,
      setupStoryCandidate,
      updateAsset,
      embedAsset,
      setLanguage,
      updateSection: updateSectionAction,
      createSection: createSectionAction,
      updateResource,
      fetchResources,
      setActiveSectionId,
    }, dispatch)
  })
)
class GlobalUiContainer extends Component {

  /**
   * Context data used by the component
   */
  static contextTypes = {

    /**
     * Un-namespaced translate function
     */
    t: React.PropTypes.func.isRequired,

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
    this.closeAndResetDialog = this.closeAndResetDialog.bind(this);
    this.openSettings = this.openSettings.bind(this);
    this.createNewSection = this.createNewSection.bind(this);
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
   * Closes story configuration modal and resets story candidate
   */
  closeAndResetDialog() {
    this.props.actions.resetStoryCandidateSettings();
    this.props.actions.closeStoryCandidateModal();
  }

  /**
   * Opens the configuration pannel of an existing story
   */
  openSettings () {
    this.props.actions.startStoryCandidateConfiguration(this.props.activeStory);
  }


  /**
   * Handles the process of building a new default section
   * with unique id and create it.
   */
  createNewSection () {
    const id = genId();
    const section = createDefaultSection();
    section.id = id;
    this.props.actions.createSection(this.props.activeStoryId, id, section, true);
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    return (
      <GlobalUiLayout
        {...this.props}
        openSettings={this.openSettings}
        closeAndResetDialog={this.closeAndResetDialog}
        updateStoryContent={this.updateStoryContent}
        onCreateNewSection={this.createNewSection} />
    );
  }
}

export default GlobalUiContainer;
