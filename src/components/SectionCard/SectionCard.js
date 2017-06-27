/* eslint react/no-find-dom-node: 0 */
/**
 * This module provides a reusable section card element component
 * @module fonio/components/SectionCard
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translateNameSpacer} from '../../helpers/translateUtils';

import {findDOMNode} from 'react-dom';


import {DragSource, DropTarget} from 'react-dnd';

import './SectionCard.scss';


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
class SectionCard extends Component {

  static contextTypes = {
    t: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
  }

  render() {
    const {
      props,
      context,
    } = this;
    const {
      metadata,
      onConfigure,
      onUpdateMetadata,
      onSelect,
      createSubSection,

      onRequestDeletePrompt,
      onAbortDeletePrompt,
      promptedToDelete,
      onDelete,

      // selectMode,
      active,
      // id,
      connectDragSource,
      connectDragPreview,
      connectDropTarget,
      isDragging,
    } = props;
    const translate = translateNameSpacer(context.t, 'Components.SectionCard');
    const onDeleteClick = e => {
      e.stopPropagation();
      onDelete();
    };

    const onConfigureClick = e => {
      e.stopPropagation();
      onConfigure();
    };

    const onCreateSubSection = e => {
      e.stopPropagation();
      e.preventDefault();
      createSubSection();
    };

    const onGlobalClick = e => {
      e.preventDefault();
      e.stopPropagation();
      if (isDragging) return;
      if (!active) {
        onSelect(metadata);
      }
      else {
        onConfigure();
      }
    };

    const onLevelDown = e => {
      e.stopPropagation();
      let level = metadata.level || 0;
      level = level > 0 ? level - 1 : level;
      onUpdateMetadata({
        ...metadata,
        level
      });
    };

    const onLevelUp = e => {
      e.stopPropagation();
      let level = metadata.level || 0;
      level = level < 5 ? level + 1 : level;
      onUpdateMetadata({
        ...metadata,
        level
      });
    };

    const onDeletePromptRequest = e => {
      e.stopPropagation();
      onRequestDeletePrompt();
    };

    const onDeletePromptAbord = e => {
      e.stopPropagation();
      onAbortDeletePrompt();
    };

    return connectDragPreview(connectDragSource(connectDropTarget(
      <li
        className={'fonio-section-card' + (active ? ' active' : '')}
        onClick={onGlobalClick}
        style={{
          marginLeft: (metadata.level ? metadata.level : 0) + 'em'
        }}>
        <div
          className="card-header">
          <img src={require('../../sharedAssets/section-black.svg')} />
          <h5>
            <span className="title">{metadata.title && metadata.title.length ? metadata.title : translate('untitled-section')}</span>
          </h5>
        </div>
        {!promptedToDelete ? <div className="card-footer">
          <button className="level-down-btn" onClick={onLevelDown}>
            ◄
          </button>
          <button className="level-up-btn" onClick={onLevelUp}>
            ►
          </button>
          <button className={'subsection-btn '} onClick={onCreateSubSection}>
            <img
              src={require('../../sharedAssets/close-black.svg')}
              className="fonio-icon-image"
              style={{transform: 'rotate(45deg)'}} />
            {translate('sub-section')}
          </button>
          <button className="settings-btn" onClick={onConfigureClick}>
            <img src={require('../../sharedAssets/settings-black.svg')} className="fonio-icon-image" />
            {translate('settings')}
          </button>
          <button className={'delete-btn '} onClick={onDeletePromptRequest}>
            <img src={require('../../sharedAssets/close-black.svg')} className="fonio-icon-image" />
            {translate('delete')}
          </button>
        </div> :
        <div className="card-footer">
          <button className="abord-delete-btn" onClick={onDeletePromptAbord}>
            {translate('abord-delete')}
          </button>
          <button className={'delete-confirm-btn '} onClick={onDeleteClick}>
            <img src={require('../../sharedAssets/close-black.svg')} className="fonio-icon-image" />
            {translate('confirm-delete')}
          </button>
        </div>
        }
      </li>
    )));
  }
}

export default SectionCard;
