/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the resources manager feature interface
 * @module fonio/features/ResourcesManager
 */
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {v4 as uuid} from 'uuid';
// import { DraggableDecorator } from 'draft-js-dnd-plugin';

import * as duck from '../duck';
import * as managerDuck from '../../StoriesManager/duck';
import {unpromptResourceEmbed} from '../../Editor/duck';

import ResourcesManagerLayout from './ResourcesManagerLayout';

/**
 * Redux-decorated component class rendering the resources manager feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.resourcesManager),
    ...managerDuck.selector(state.stories),
    lang: state.i18nState.lang
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      unpromptResourceEmbed
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

  createResource(resource) {
    const id = uuid();
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
        updateResource={this.updateResource} />
    );
  }
}

export default ResourcesManagerContainer;
