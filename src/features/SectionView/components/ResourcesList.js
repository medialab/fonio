import React, {Component} from 'react';

import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

// import DragLayer from './DragLayer';


import {
  Column,
} from 'quinoa-design-library/components/';

import ResourceMiniCard from './ResourceMiniCard';

@DragDropContext(HTML5Backend)
export default class ResourcesList extends Component {

  constructor(props, context) {
    super(props, context);
  }


  render = () => {
    const {
      resources,
      deleteResource,
      storyId,
      userId,
      onResourceEditAttempt,
      reverseResourcesLockMap,
      userLockedResourceId,
      getResourceTitle,
    } = this.props;
    return (
      <div>

        {
        resources
        .map(resource => {
          const handleDelete = () => {
            deleteResource({
              storyId,
              userId,
              resourceId: resource.id
            });
          };
          const handleEdit = () => {
            onResourceEditAttempt(resource.id);
          };
          return (
            <Column style={{margin: '0 0 1rem 0', padding: 0}} key={resource.id}>
              <ResourceMiniCard
                resource={resource}
                onDelete={handleDelete}
                getTitle={getResourceTitle}
                lockData={reverseResourcesLockMap[resource.id]}
                isActive={userLockedResourceId}
                onEdit={handleEdit} />
            </Column>
          );
        })
      }
      </div>
    );
  }
}
