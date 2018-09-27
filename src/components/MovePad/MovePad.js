/**
 * This module provides a ui components for handling an element moving (top, left, up, down - or drag)
 * @module fonio/components/MovePad
 */
/**
 * Imports Libraries
 */
import React from 'react';
import {
  Icon,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { silentEvent } from '../../helpers/misc';

/**
 * Imports Assets
 */
import './MovePad.scss';

const MovePad = ( {
  style,
  MoveComponent,
  chevronsData = {},
  moveComponentToolTip,
} ) => {

  /**
   * Computed variables
   */
  const tooltipProps = {
    'data-for': 'tooltip',
    'data-effect': 'solid',
    'data-place': 'left'
  };

  /**
   * Callbacks handlers
   */
  const handleClickLeft = chevronsData.left && chevronsData.left.onClick;
  const handleClickRight = chevronsData.right && chevronsData.right.onClick;
  const handleClickUp = chevronsData.up && chevronsData.up.onClick;
  const handleClickDown = chevronsData.down && chevronsData.down.onClick;

  return (
    <div
      onMouseUp={ silentEvent }
      onMouseDown={ silentEvent }
      onClick={ silentEvent }
      style={ style }
      className={ 'move-pad' }
    >
      {
        chevronsData.left &&
        <div
          {...tooltipProps}
          data-tip={ chevronsData.left.isDisabled ? undefined : chevronsData.left.tooltip }
          onClick={ handleClickLeft }
          className={ `move-item chevron-icon-left ${chevronsData.left.isDisabled ? 'is-disabled' : ''}` }
        >
          <Icon icon={ 'chevron-left' } />
        </div>
      }
      {
        chevronsData.right &&
        <div
          {...tooltipProps}
          data-tip={ chevronsData.right.isDisabled ? undefined : chevronsData.right.tooltip }
          onClick={ handleClickRight }
          className={ `move-item chevron-icon-right ${chevronsData.right.isDisabled ? 'is-disabled' : ''}` }
        >
          <Icon icon={ 'chevron-right' } />
        </div>
      }
      {
        chevronsData.up &&
        <div
          {...tooltipProps}
          data-tip={ chevronsData.up.isDisabled ? undefined : chevronsData.up.tooltip }
          onClick={ handleClickUp }
          className={ `move-item chevron-icon-up ${chevronsData.up.isDisabled ? 'is-disabled' : ''}` }
        >
          <Icon icon={ 'chevron-up' } />
        </div>
      }
      {
        chevronsData.down &&
        <div
          {...tooltipProps}
          data-tip={ chevronsData.down.isDisabled ? undefined : chevronsData.down.tooltip }
          onClick={ handleClickDown }
          className={ `move-item chevron-icon-down ${chevronsData.down.isDisabled ? 'is-disabled' : ''}` }
        >
          <Icon icon={ 'chevron-down' } />
        </div>
      }

      <div
        className={ 'move-item move-button' }
        {...tooltipProps}
        data-tip={ moveComponentToolTip }
      >
        <MoveComponent />
      </div>
    </div>
  );
};

export default MovePad;
