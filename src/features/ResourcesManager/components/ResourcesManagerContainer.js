/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the resources manager feature interface
 * @module fonio/features/ResourcesManager
 */
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {v4 as genId} from 'uuid';

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
  summonAsset,
} from '../../../helpers/assetsUtils';


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
   * Handles the process of embedding an asset in the current editor
   * Basically this is just a more specific wrapper of this.summonAsset
   */
  embedAsset = resourceId => {
    const {
      activeSectionId,
      editorFocus: currentEditorFocus,
      previousEditorFocus,
      actions,
    } = this.props;


    const {
      unpromptAssetEmbed,
    } = actions;

    const editorFocus = currentEditorFocus || previousEditorFocus;
    let contentId = editorFocus; // assetRequestState.editorId;
    contentId = (contentId === activeSectionId || !contentId) ? 'main' : editorFocus;
    summonAsset(contentId, resourceId, this.props);
    unpromptAssetEmbed();
  }

  embedLastResource = () => {
    const resources = this.props.activeStory.resources;
    const resourcesMap = Object.keys(resources).map(id => resources[id]);
    const lastResource = resourcesMap.sort((a, b) => {
      if (a.metadata.createdAt > b.metadata.createdAt) {
        return -1;
      }
 else {
        return 1;
      }
    })[0];
    if (lastResource) {
      this.embedAsset(lastResource.id);
    }
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
        createdAt: new Date().getTime(),
        lastModifiedAt: new Date().getTime(),
        id
      }
    };
    const {type} = resource.metadata;
    if ((type === 'image' && resource.data.base64) || (type === 'data-presentation' && resource.data.json) || (type === 'table' && resource.data.json)) {
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
    const newResource = {
      ...resource,
      metadata: {
        ...resource.metadata,
        lastModifiedAt: new Date().getTime()
      }
    };
    const {type} = resource.metadata;
    if ((type === 'image' && resource.data.base64) || (type === 'data-presentation' && resource.data.json) || (type === 'table' && resource.data.json)) {
      const token = localStorage.getItem(activeStoryId);
      this.props.actions.uploadResourceRemote(activeStoryId, id, newResource, token);
    }
    else
      this.props.actions.updateResource(activeStoryId, id, newResource);
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
        embedLastResource={this.embedLastResource}
        setCoverImage={this.setCoverImage} />
    );
  }
}

export default ResourcesManagerContainer;
