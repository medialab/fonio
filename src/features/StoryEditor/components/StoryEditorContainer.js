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
  startExistingResourceConfiguration,
} from '../../ResourcesManager/duck';

import {
  // insertAssetInEditor,
  insertInlineContextualization,
  insertBlockContextualization,
} from '../../../helpers/draftUtils';

import {
  createDefaultSection
} from '../../../helpers/schemaUtils';


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
   * Closes the story configuration view
   * and resets story candidate
   */
  closeAndResetDialog() {
    this.props.actions.resetStoryCandidateSettings();
    this.props.actions.closeStoryCandidateModal();
  }

  /**
   * Opens active story settings
   */
  openSettings () {
    this.props.actions.startStoryCandidateConfiguration(this.props.activeStory);
  }

  createNewSection () {
    const id = genId();
    const section = createDefaultSection();
    section.id = id;
    this.props.actions.createSection(this.props.activeStoryId, id, section, true);
  }


  /**
   * Handle the process of creating a new asset in the active story.
   * This implies three operations :
   * - create a contextualizer (which defines a way of materializing the resource)
   * - create contextualization (unique combination of a contextualizer, a section and a resource)
   * - insert an entity linked to the contextualization in the proper draft-js content state (main or note of the section)
   * @param {string} contentId - the id of editor to target ('main' or note id)
   * @param {string} resourceId - id of the resource to summon
   */
  summonAsset = (contentId, resourceId) => {
    // todo: this is a duplicate with ResourcesManagerContainer.summonAsset
    // so this should be refactored as a shared helper
    // or some other solution should be found not to repeat it
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

    // 1. create contextualizer
    // question: why isn't the contextualizer
    // data directly embedded in the contextualization data ?
    // answer: that way we can envisage for the future to
    // give users a possibility to reuse the same contextualizer
    // for different resources (e.g. comparating datasets)
    // and we can handle multi-modality in a smarter way.

    // todo : consume model to do that
    const contextualizerId = genId();
    const contextualizer = {
      id: contextualizerId,
      type: resource.metadata.type,
    };
    createContextualizer(activeStoryId, contextualizerId, contextualizer);

    // choose if inline or block
    // todo: for now we infer from the resource type whether contextualization
    // must be in block or inline mode.
    // but we could choose to let the user decide
    // (e.g. 1: a 'bib' reference in block mode
    // could be the full reference version of the reference)
    // (e.g. 2: a 'quinoa presentation' reference in inline mode
    // could be an academic-like short citation of this reference)

    // todo: choose that from resource model
    const insertionType = resource.metadata.type === 'bib' || resource.metadata.type === 'glossary' ? 'inline' : 'block';

    // 2. create contextualization
    const contextualizationId = genId();
    const contextualization = {
      id: contextualizationId,
      resourceId,
      contextualizerId,
      sectionId: activeSectionId
    };
    createContextualization(activeStoryId, contextualizationId, contextualization);

    // 3. update the proper editor state
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


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    return (
      <StoryEditorLayout
        {...this.props}
        openSettings={this.openSettings}
        closeAndResetDialog={this.closeAndResetDialog}
        onCreateNewSection={this.createNewSection}
        summonAsset={this.summonAsset} />
    );
  }
}

export default EditorContainer;
