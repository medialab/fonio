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
      resetStoryCandidateSettings,
      setupStoryCandidate,
      updateAsset,
      embedAsset,
      setLanguage,
      updateSection: updateSectionAction,
      createSection: createSectionAction,
      updateResource,
      setActiveSectionId,
    }, dispatch)
  })
)
class GlobalUiContainer extends Component {

  static contextTypes = {
    t: React.PropTypes.func.isRequired,
    store: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.closeAndResetDialog = this.closeAndResetDialog.bind(this);
    this.returnToLanding = this.returnToLanding.bind(this);
    this.openSettings = this.openSettings.bind(this);
    this.createNewSection = this.createNewSection.bind(this);
  }

  shouldComponentUpdate() {
    return true;
  }

  closeAndResetDialog() {
    this.props.actions.resetStoryCandidateSettings();
    this.props.actions.closeStoryCandidateModal();
  }

  returnToLanding() {
    this.props.actions.unsetActiveStory();
  }

  openSettings () {
    this.props.actions.startStoryCandidateConfiguration(this.props.activeStory);
  }

  createNewSection () {
    const id = genId();
    const section = createDefaultSection();
    section.id = id;
    this.props.actions.createSection(this.props.activeStoryId, id, section, true);
  }

  render() {

    return (
      <GlobalUiLayout
        {...this.props}
        openSettings={this.openSettings}
        closeAndResetDialog={this.closeAndResetDialog}
        returnToLanding={this.returnToLanding}
        updateStoryContent={this.updateStoryContent}
        onCreateNewSection={this.createNewSection} />
    );
  }
}

export default GlobalUiContainer;
