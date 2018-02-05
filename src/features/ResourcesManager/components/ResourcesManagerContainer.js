/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the resources manager feature interface
 * @module fonio/features/ResourcesManager
 */
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {v4 as genId} from 'uuid';

import {
  convertToRaw
} from 'draft-js';
// import { DraggableDecorator } from 'draft-js-dnd-plugin';

import * as duck from '../duck';
import * as managerDuck from '../../StoriesManager/duck';
import * as editorDuck from '../../StoryEditor/duck';
import * as globalUiDuck from '../../GlobalUi/duck';
import * as sectionsDuck from '../../SectionsManager/duck';

import {
  updateSection as updateSectionAction,
} from '../../SectionsManager/duck';


import {
  // insertAssetInEditor,
  insertInlineContextualization,
  insertBlockContextualization,
} from '../../../helpers/draftUtils';


import ResourcesManagerLayout from './ResourcesManagerLayout';


/**
 * Redux-decorated component class rendering the resources manager feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.resourcesManager),
    ...managerDuck.selector(state.stories),
    ...editorDuck.selector(state.storyEditor),
    ...globalUiDuck.selector(state.globalUi),
    ...sectionsDuck.selector(state.sectionsManager),
    lang: state.i18nState.lang,
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      ...editorDuck,
      ...globalUiDuck,
      updateSection: updateSectionAction,
      unpromptAssetEmbed: editorDuck.unpromptAssetEmbed,
    }, dispatch)
  })
)
class ResourcesManagerContainer extends Component {

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
    this.createResource = this.createResource.bind(this);
    this.updateResource = this.updateResource.bind(this);
    this.deleteResource = this.deleteResource.bind(this);
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
   * Handle the process of creating a new asset in the active story.
   * This implies three operations :
   * - create a contextualizer (which defines a way of materializing the resource)
   * - create contextualization (unique combination of a contextualizer, a section and a resource)
   * - insert an entity linked to the contextualization in the proper draft-js content state (main or note of the section)
   * @param {string} contentId - the id of editor to target ('main' or note id)
   * @param {string} resourceId - id of the resource to summon
   */
  summonAsset = (contentId, resourceId) => {
    // todo: this is a duplicate with StoryEditorContainer.summonAsset
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
    const insertionType = resource.metadata.type === 'bib' ? 'inline' : 'block';

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
   * Handles the process of embedding an asset in the current editor
   * Basically this is just a more specific wrapper of this.summonAsset
   */
  embedAsset = resourceId => {
    const {
      activeSectionId,
      editorFocus,
      actions,
    } = this.props;

    const {
      unpromptAssetEmbed,
    } = actions;
    let contentId = editorFocus; // assetRequestState.editorId;
    contentId = (contentId === activeSectionId || !contentId) ? 'main' : editorFocus;
    this.summonAsset(contentId, resourceId);
    unpromptAssetEmbed();
  }

  setCoverImage = (resourceId) => {
    const {
      activeStoryId,
      actions,
    } = this.props;

    const {
      updateStoryMetadataField
    } = actions;
    updateStoryMetadataField(activeStoryId, 'coverImage', {resourceId});
  }
  /**
   * Creates a default resource by attributing the given resource
   * a unique id
   * @param {object} resource - the resource to create
   */
  createResource(resource) {
    const id = genId();
    const {
      activeStoryId
    } = this.props;
    const newResource = {
      ...resource,
      id,
      metadata: {
        ...resource.metadata,
        id
      }
    };
    const {type} = resource.metadata;
    if ((type === 'image' && resource.data.base64) || type === 'data-presentation' || type === 'table') {
      const token = localStorage.getItem(activeStoryId);
      this.props.actions.uploadResourceRemote(activeStoryId, id, newResource, token);
    }
    else
      this.props.actions.createResource(activeStoryId, id, newResource);
  }


  /**
   * Updates a given resource in the proper story
   * @param {string} id - id of the resource
   * @param {object} resource - the new resource to merge with the old
   */
  updateResource(id, resource) {
    const {
      activeStoryId
    } = this.props;
    const {type} = resource.metadata;
    if ((type === 'image' && resource.data.base64) || type === 'data-presentation' || type === 'table') {
      const token = localStorage.getItem(activeStoryId);
      this.props.actions.uploadResourceRemote(activeStoryId, id, resource, token);
    }
    else
      this.props.actions.updateResource(activeStoryId, id, resource);
  }

  /**
   * delete a resource of the story
   * @param {string} id - id of the resource
   * @param {object} resource - the new resource to merge with the old
   */
  deleteResource(resource) {
    const {
      activeStoryId
    } = this.props;
    const {type} = resource.metadata;
    if (type === 'image' || type === 'data-presentation' || type === 'table') {
      const token = localStorage.getItem(activeStoryId);
      this.props.actions.deleteResourceRemote(activeStoryId, resource, token);
    }
    else
      this.props.actions.deleteResource(activeStoryId, resource.id);
  }

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const {resourcesSearchQuery, resourcesTypeQuery} = this.props;
    let resources = this.props.activeStory.resources;
    if (resources) {
      const selectedResourcesIds = this.props.selectedResources;
      // we want to display only
      // the resources being filtered-in
      // if the user has input some search query
      // in the resources pannel
      resources = Object.keys(resources)
      .filter(resourceKey => {
        if (selectedResourcesIds && selectedResourcesIds.length) {
         return selectedResourcesIds.indexOf(resourceKey) > -1;
        }
        else return true;
      })
      .map(id => ({...this.props.activeStory.resources[id], id}))
      .filter(resource => {
        // filter by resource type
        if (resourcesTypeQuery && resourcesTypeQuery.length) {
          return resource.metadata.type === resourcesTypeQuery;
        }
        else return true;
      })
      .filter(resource => {
        // for now we handle search by serializing the whole resource and searching the query into it
        // todo: handle that with more finesse
        if (resourcesSearchQuery && resourcesSearchQuery.length) {
          return JSON.stringify(resource.metadata).toLowerCase().indexOf(resourcesSearchQuery.toLowerCase()) > -1;
        }
        else return true;
      });
    }
    return (
      <ResourcesManagerLayout
        {...this.props}
        resources={resources}
        createResource={this.createResource}
        updateResource={this.updateResource}
        deleteResource={this.deleteResource}
        embedAsset={this.embedAsset}
        setCoverImage={this.setCoverImage} />
    );
  }
}

export default ResourcesManagerContainer;
