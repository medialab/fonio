/* eslint react/prefer-stateless-function : 0 */
import React, {Component} from 'react';

import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import FlipMove from 'react-flip-move';


// import DragLayer from './DragLayer';


import {
  Column,
} from 'quinoa-design-library/components/';

import ResourceMiniCard from './ResourceMiniCard';

class ResourceCardWrapper extends Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const {
      resource,
      handleDelete,
      getResourceTitle,
      reverseResourcesLockMap,
      userLockedResourceId,
      onSetCoverImage,
      handleEdit
    } = this.props;
    return (<Column style={{margin: '0 0 1rem 0', padding: 0}} key={resource.id}>
      <ResourceMiniCard
        resource={resource}
        onDelete={handleDelete}
        getTitle={getResourceTitle}
        onSetCoverImage={onSetCoverImage}
        lockData={reverseResourcesLockMap[resource.id]}
        isActive={userLockedResourceId}
        onEdit={handleEdit} />
    </Column>);
  }
}

@DragDropContext(HTML5Backend)
export default class ResourcesList extends Component {

  constructor(props, context) {
    super(props, context);
  }


  render = () => {
    const {
      resources,
      onDeleteResource,
      onResourceEditAttempt,
      onSetCoverImage,
      reverseResourcesLockMap,
      userLockedResourceId,
      getResourceTitle,
    } = this.props;
    return (
      <FlipMove>
        {
        resources
        .map(resource => {
          const handleDelete = () => {
            onDeleteResource(resource.id);
          };
          const handleEdit = () => {
            onResourceEditAttempt(resource.id);
          };
          const handleSetCover = () => {
            onSetCoverImage(resource.id);
          };
          return (
            <ResourceCardWrapper
              key={resource.id}
              resource={resource}
              handleDelete={handleDelete}
              getResourceTitle={getResourceTitle}
              reverseResourcesLockMap={reverseResourcesLockMap}
              onSetCoverImage={handleSetCover}
              userLockedResourceId={userLockedResourceId}
              handleEdit={handleEdit} />
          );
        })
      }
      </FlipMove>
    );
  }
}
