/* eslint react/no-find-dom-node: 0 */
/**
 * This module provides a reusable big select element component
 * @module fonio/components/BigSelect
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translateNameSpacer} from '../../helpers/translateUtils';

import {DragSource, DropTarget} from 'react-dnd';

import {findDOMNode} from 'react-dom';

import './ResourceCard.scss';

const sectionSource = {
  beginDrag(props) {
    return {
      id: props.sectionKey,
      index: props.sectionIndex
    };
  }
};

const sectionTarget = {
  /**
   * Drag on hover behavior
   * Initial design & implementation @yomguithereal
   * (https://github.com/medialab/quinoa/blob/master/src/components/draggable.js)
   */
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index,
          hoverIndex = props.sectionIndex;
    // If itself, we break
    if (dragIndex === hoverIndex)
      return;

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    props.onMove(dragIndex, hoverIndex);
    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
};

@DragSource('SECTION', sectionSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
}))
@DropTarget('SECTION', sectionTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver()
}))
class ResourceCard extends Component {

  static contextTypes = {
    t: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
  }
  render() {
    const {
      props,
      context
    } = this;
    const {
      metadata,
      onDelete,
      onConfigure,
      selectMode,
      onSelect,

      connectDragSource,
      connectDragPreview,
      connectDropTarget,
      // isDragging,
    } = props;
    const translate = translateNameSpacer(context.t, 'Components.ResourceCard');
    const onDeleteClick = e => {
      e.stopPropagation();
      onDelete();
    };

    const onConfigureClick = e => {
      e.stopPropagation();
      onConfigure();
    };

    const onGlobalClick = () => {
      if (selectMode) {
        onSelect(metadata);
      }
   else {
        onConfigure();
      }
    };

    const startDrag = (e) => {
      if (selectMode) {
        return e.preventDefault();
      }
       e.dataTransfer.dropEffect = 'move';
       e.dataTransfer.setData('text', 'DRAFTJS_RESOURCE_ID:' + metadata.id);
     };
    return connectDragPreview(connectDragSource(connectDropTarget(
      <li
        draggable
        onDragStart={startDrag}
        className={'fonio-ResourceCard' + (selectMode ? ' select-mode' : '')}
        onClick={onGlobalClick}>
        <div
          className="card-header">
          <img src={require('../../sharedAssets/' + metadata.type + '-black.svg')} />
          <h5>
            <span className="title">{metadata.title && metadata.title.length ? metadata.title : translate('untitled-asset')}</span>
          </h5>
        </div>
        {/*<div
          className="card-body">
          <div className="info-column">
            <p className="description">
              {metadata.description && metadata.description.length ? metadata.description : translate('no-description')}
            </p>
          </div>
          <div className="buttons-column" />
        </div>*/}
        <div className="card-footer">
          <button className="settings-btn" onClick={onConfigureClick}>
            <img src={require('../../sharedAssets/settings-black.svg')} className="fonio-icon-image" />
            {translate('settings')}
          </button>
          <button className={'delete-btn '} onClick={onDeleteClick}>
            <img src={require('../../sharedAssets/close-black.svg')} className="fonio-icon-image" />
            {translate('delete')}
          </button>
        </div>
      </li>
    )));
  }
}

export default ResourceCard;
