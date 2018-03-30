/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the editor feature interface
 * @module fonio/features/Editor
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {setLanguage} from 'redux-i18n';
import {v4 as genId} from 'uuid';

import StoryEditorLayout from './StoryEditorLayout';
import * as duck from '../duck';
import * as managerDuck from '../../StoriesManager/duck';
import * as globalUiDuck from '../../GlobalUi/duck';

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
  createResource,
  updateResource,
  startNewResourceConfiguration,
  startExistingResourceConfiguration,
} from '../../ResourcesManager/duck';

import {
  createDefaultSection
} from '../../../helpers/schemaUtils';

import {
  summonAsset
} from '../../../helpers/assetsUtils';


/**
 * Redux-decorated component class rendering the takeaway dialog feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.storyEditor),
    ...managerDuck.selector(state.stories),
    ...sectionsSelector(state.sectionsManager),
    ...globalUiDuck.selector(state.globalUi),
    lang: state.i18nState.lang,
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      ...globalUiDuck,
      resetStoryCandidateSettings,
      setupStoryCandidate,
      updateAsset,
      embedAsset,
      setLanguage,
      updateSection: updateSectionAction,
      createSection: createSectionAction,
      updateResource,
      createResource,
      setActiveSectionId,
      startNewResourceConfiguration,
      startExistingResourceConfiguration,
    }, dispatch)
  })
)
class EditorContainer extends Component {


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
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @param {object} nextState - the state to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate = () => {
    // todo: optimize when the feature is stabilized
    return true;
  }


  /**
   * Closes the story configuration view
   * and resets story candidate
   */
  closeAndResetDialog = () => {
    this.props.actions.resetStoryCandidateSettings();
    this.props.actions.closeStoryCandidateModal();
  }

  /**
   * Opens active story settings
   */
  openSettings = () => {
    this.props.actions.startStoryCandidateConfiguration(this.props.activeStory);
  }

  createNewSection = () => {
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
    const onSummonAsset = (contentId, resourceId) => summonAsset(contentId, resourceId, this.props);
    return (
      <StoryEditorLayout
        {...this.props}
        openSettings={this.openSettings}
        closeAndResetDialog={this.closeAndResetDialog}
        onCreateNewSection={this.createNewSection}
        summonAsset={onSummonAsset} />
    );
  }
}

export default EditorContainer;
