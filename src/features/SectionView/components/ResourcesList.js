/* eslint react/prefer-stateless-function : 0 */
import React, {Component} from 'react';

import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
// import FlipMove from 'react-flip-move';
import {List, AutoSizer} from 'react-virtualized';

// import {getResourceTitle} from '../../../helpers/resourcesUtils';
// import DragLayer from './DragLayer';
import ReactTooltip from 'react-tooltip';

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
      userId,
      handleDelete,
      getResourceTitle,
      reverseResourcesLockMap,
      userLockedResourceId,
      onSetCoverImage,
      coverImageId,
      handleEdit
    } = this.props;
    return (<Column key={resource.id}>
      <ResourceMiniCard
        resource={resource}
        onDelete={handleDelete}
        getTitle={getResourceTitle}
        onSetCoverImage={onSetCoverImage}
        coverImageId={coverImageId}
        lockData={reverseResourcesLockMap[resource.id]}
        isActive={userLockedResourceId === userId}
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
      userId,
      onDeleteResource,
      onResourceEditAttempt,
      onSetCoverImage,
      coverImageId,
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
        const id = resources[index].id;
        if (coverImageId === id) {
          onSetCoverImage(undefined);
        }
 else {
          onSetCoverImage(resources[index].id);
        }
      };
      return (
        <div key={key} style={style}>
          <ResourceCardWrapper
            resource={resources[index]}
            userId={userId}
            handleDelete={handleDelete}
            getResourceTitle={getResourceTitle}
            reverseResourcesLockMap={reverseResourcesLockMap}
            onSetCoverImage={handleSetCover}
            coverImageId={coverImageId}
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
            rowHeight={210}
            rowRenderer={rowRenderer}
            width={width}
            onRowsRendered={() =>
              ReactTooltip.rebuild()
            } />
        )}
      </AutoSizer>
    );
  }
}
