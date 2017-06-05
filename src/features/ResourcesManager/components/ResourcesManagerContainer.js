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
import * as editorDuck from '../../Editor/duck';

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
    ...editorDuck.selector(state.fonioEditor),
    lang: state.i18nState.lang
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      ...editorDuck,
      updateSection: updateSectionAction,
      unpromptAssetEmbed: editorDuck.unpromptAssetEmbed,
    }, dispatch)
  })
)
class ResourcesManagerContainer extends Component {
  /**
   * constructor
   */
  constructor(props) {
    super(props);
    this.createResource = this.createResource.bind(this);
    this.updateResource = this.updateResource.bind(this);
  }

  shouldComponentUpdate() {
    return true;
  }

  embedAsset = resourceId => {
    const {
      assetRequestState,
      activeStoryId,
      activeStory,
      activeSectionId,
      editorStates,
      actions,
    } = this.props;

    const contentId = assetRequestState.editorId;

    const {
      createContextualizer,
      createContextualization,
      updateDraftEditorState,
      updateSection,
      unpromptAssetEmbed,
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
    // console.log('contextualization', contextualization, activeSectionId);

    const editorStateId = contentId === 'main' ? activeSectionId : contentId;
    const editorState = editorStates[editorStateId];
    // console.log('editor state', editorState, editorStateId, editorStates);
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
    unpromptAssetEmbed();
  }

  createResource(resource) {
    const id = genId();
    const {
      activeStoryId
    } = this.props;
    this.props.actions.createResource(activeStoryId, id, {
      ...resource,
      metadata: {
        ...resource.metadata,
        id
      }
    });
  }
  updateResource(id, resource) {
    const {
      activeStoryId
    } = this.props;
    this.props.actions.updateResource(activeStoryId, id, resource);
  }


  render() {
    const resourcesSearchQuery = this.props.resourcesSearchQuery;
    let resources = this.props.activeStory.resources;
    if (resources) {
      const selectedResourcesIds = this.props.selectedResources;
      resources = Object.keys(resources)
      .filter(resourceKey => {
        if (selectedResourcesIds && selectedResourcesIds.length) {
         return selectedResourcesIds.indexOf(resourceKey) > -1;
        }
        else return true;
      })
      .map(id => ({...this.props.activeStory.resources[id], id}))
      .filter(resource => {
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
        embedAsset={this.embedAsset} />
    );
  }
}

export default ResourcesManagerContainer;
