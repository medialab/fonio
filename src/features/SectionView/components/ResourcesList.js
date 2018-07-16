/* eslint react/prefer-stateless-function : 0 */
import React, {Component} from 'react';

import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
// import FlipMove from 'react-flip-move';
import {List, AutoSizer} from 'react-virtualized';


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

    const rowRenderer = ({
      key,
      index,
      style,
    }) => {
      const handleDelete = () => {
        onDeleteResource(resources[index].id);
      };
      const handleEdit = () => {
        onResourceEditAttempt(resources[index].id);
      };
      const handleSetCover = () => {
        onSetCoverImage(resources[index].id);
      };
      return (
        <div key={key} style={style}>
          <ResourceCardWrapper
            resource={resources[index]}
            handleDelete={handleDelete}
            getResourceTitle={getResourceTitle}
            reverseResourcesLockMap={reverseResourcesLockMap}
            onSetCoverImage={handleSetCover}
            userLockedResourceId={userLockedResourceId}
            handleEdit={handleEdit} />
        </div>
      );
    };
    return (
      <AutoSizer>
        {({width, height}) => (
          <List
            height={height}
            rowCount={resources.length}
            rowHeight={240}
            rowRenderer={rowRenderer}
            width={width} />
        )}
      </AutoSizer>
    );
  }
}
