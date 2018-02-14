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


/**
 * react-dnd drag & drop handlers
 */


/**
 * drag source handler
 */
const sectionSource = {
  beginDrag(props) {
    return {
      id: props.sectionKey,
      index: props.sectionIndex
    };
  }
};

/**
 * drag target handler
 */
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


/**
 * dnd-related decorators for the SectionCard class
 */
@DragSource('SECTION', sectionSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
}))
@DropTarget('SECTION', sectionTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver()
}))

/**
 * VisualizationManager class for building react component instances
 */
class SectionCard extends Component {


  /**
   * Component's context used properties
   */
  static contextTypes = {

    /**
     * Un-namespaced translate function
     */
    t: PropTypes.func.isRequired
  }


  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const {
      props,
      context,
    } = this;
    const {
      metadata,
      selectedSectionLevel,
      onConfigure,
      onUpdateMetadata,
      onSelect,
      createSubSection,
      active,

      onRequestDeletePrompt,
      onAbortDeletePrompt,
      promptedToDelete,
      onDelete,

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
      level = level < parseInt(selectedSectionLevel, 10) ? level + 1 : level;
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
        className={'fonio-SectionCard' + (active ? ' active' : '')}
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
          {metadata.level < selectedSectionLevel &&
            <button className="level-up-btn" onClick={onLevelUp}>
              ►
            </button>
          }
          {metadata.level < selectedSectionLevel &&
            <button className={'subsection-btn '} onClick={onCreateSubSection}>
              <img
                src={require('../../sharedAssets/close-black.svg')}
                className="fonio-icon-image"
                style={{transform: 'rotate(45deg)'}} />
              {translate('sub-section')}
            </button>
          }
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


/**
 * Component's properties types
 */
SectionCard.propTypes = {

  /**
   * metadata of the section
   */
  metadata: PropTypes.object,

  /**
   * whether the section is currently edited
   */
  active: PropTypes.bool,

  /**
   * whether the section is currently asking user whether to delete it
   */
  promptedToDelete: PropTypes.bool,

  /**
   * callbacks when section configuration is asked
   */
  onConfigure: PropTypes.func,

  /**
   * callbacks when section metadata update is asked
   */
  onUpdateMetadata: PropTypes.func,

  /**
   * callbacks when user clicks on "create sub section"
   */
  createSubSection: PropTypes.func,

  /**
   * callbacks when section is selected
   */
  onSelect: PropTypes.func,

  /**
   * callbacks when user asks for section deletion
   */
  onRequestDeletePrompt: PropTypes.func,

  /**
   * callbacks when user dismisses the section deletion prompt
   */
  onAbortDeletePrompt: PropTypes.func,

  /**
   * callbacks when section asks to be deleted
   */
  onDelete: PropTypes.func,

  /**
   * callbacks when card starts to be dragged
   */
  connectDragSource: PropTypes.func,

  /**
   * callbacks when card preview is required during the drag process
   */
  connectDragPreview: PropTypes.func,

  /**
   * callbacks when card is dropped
   */
  connectDropTarget: PropTypes.func,

  /**
   * Whether the card is dragged
   */
  isDragging: PropTypes.bool,
};

export default SectionCard;
