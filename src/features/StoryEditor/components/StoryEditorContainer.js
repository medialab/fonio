/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the editor feature interface
 * @module fonio/features/Editor
 */
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {setLanguage} from 'redux-i18n';
import {v4 as genId} from 'uuid';

import {debounce} from 'lodash';

import {
  convertToRaw
} from 'draft-js';

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
  updateResource,
} from '../../ResourcesManager/duck';

import {
  // insertAssetInEditor,
  insertInlineContextualization,
  insertBlockContextualization,
} from '../../../helpers/draftUtils';

import {
  createDefaultSection
} from '../../../helpers/modelsUtils';


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
      setActiveSectionId,
    }, dispatch)
  })
)
class EditorContainer extends Component {

  static contextTypes = {
    t: React.PropTypes.func.isRequired,
    store: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.closeAndResetDialog = this.closeAndResetDialog.bind(this);
    this.returnToLanding = this.returnToLanding.bind(this);
    this.openSettings = this.openSettings.bind(this);
    this.updateStoryContent = this.updateStoryContent.bind(this);

    this.createNewSection = this.createNewSection.bind(this);

    this.updateStoryContentDebounced = debounce(this.updateStoryContentDebounced, 1000);
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

  updateStoryContentDebounced (id, content) {
    this.props.actions.serializeStoryContent(id, content);
  }

  updateStoryContent (id, content) {
    this.props.actions.updateStoryContent(id, content);
    this.updateStoryContentDebounced(id, content);
  }

  createNewSection () {
    const id = genId();
    const section = createDefaultSection();
    section.id = id;
    this.props.actions.createSection(this.props.activeStoryId, id, section, true);
  }

  summonAsset = (contentId, resourceId) => {
    const {
      activeStoryId,
      activeStory,
      activeSectionId,
      editorStates,
      actions,
    } = this.props;

    const {
      createContextualizer,
      createContextualization,
      updateDraftEditorState,
      updateSection,
    } = actions;

    const activeSection = activeStory.sections[activeSectionId];
    const resource = activeStory.resources[resourceId];

    // create contextualizer
    // todo : consume model to do that
    const contextualizerId = genId();
    const contextualizer = {
      id: contextualizerId,
      type: resource.metadata.type,
    };
    createContextualizer(activeStoryId, contextualizerId, contextualizer);

    // choose if inline or block
    // todo: choose that from resource model
    const insertionType = resource.metadata.type === 'bib' ? 'inline' : 'block';

    // create contextualization
    const contextualizationId = genId();
    const contextualization = {
      id: contextualizationId,
      resourceId,
      contextualizerId,
      sectionId: activeSectionId
    };
    createContextualization(activeStoryId, contextualizationId, contextualization);

    const editorStateId = contentId === 'main' ? activeSectionId : contentId;
    const editorState = editorStates[editorStateId];
    // update related editor state
    const newEditorState = insertionType === 'block' ?
      insertBlockContextualization(editorState, contextualization, contextualizer, resource) :
      insertInlineContextualization(editorState, contextualization, contextualizer, resource);
    // update immutable editor state
    updateDraftEditorState(editorStateId, newEditorState);
    // update serialized editor state
    let newSection;
    if (contentId === 'main') {
      newSection = {
        ...activeSection,
        contents: convertToRaw(newEditorState.getCurrentContent())
      };
    }
 else {
      newSection = {
        ...activeSection,
        notes: {
          ...activeSection.notes,
          [contentId]: {
            ...activeSection.notes[contentId],
            editorState: convertToRaw(newEditorState.getCurrentContent())
          }
        }
      };
    }
    updateSection(activeStoryId, activeSectionId, newSection);
  }

  render() {
    return (
      <StoryEditorLayout
        {...this.props}
        openSettings={this.openSettings}
        closeAndResetDialog={this.closeAndResetDialog}
        returnToLanding={this.returnToLanding}
        updateStoryContent={this.updateStoryContent}
        onCreateNewSection={this.createNewSection}
        summonAsset={this.summonAsset} />
    );
  }
}

export default EditorContainer;
