import React from 'react';

import {
  // Button,
  Icon
} from 'quinoa-design-library/components/';

import './MovePad.scss';

const MovePad = ({
  style,
  MoveComponent,
  chevronsData = {},
  moveComponentToolTip,
}) => {
  const silent = event => {
    event.stopPropagation();
  };
  return (
    <div
      onMouseUp={silent} onMouseDown={silent} onClick={silent}
      style={style} className={'move-pad'}>
      {
        chevronsData.left &&
        <div
          data-tip={chevronsData.left.isDisabled ? undefined : chevronsData.left.tooltip}
          data-for={'tooltip'}
          data-effect={'solid'}
          data-place={'left'}
          onClick={chevronsData.left.onClick}
          className={`move-item chevron-icon-left ${chevronsData.left.isDisabled ? 'is-disabled' : ''}`}>
          <Icon icon={'chevron-left'} />
        </div>
      }
      {
        chevronsData.right &&
        <div
          data-tip={chevronsData.right.isDisabled ? undefined : chevronsData.right.tooltip}
          data-for={'tooltip'}
          data-effect={'solid'}
          data-place={'left'}
          onClick={chevronsData.right.onClick}
          className={`move-item chevron-icon-right ${chevronsData.right.isDisabled ? 'is-disabled' : ''}`}>
          <Icon icon={'chevron-right'} />
        </div>
      }
      {
        chevronsData.up &&
        <div
          data-tip={chevronsData.up.isDisabled ? undefined : chevronsData.up.tooltip}
          data-for={'tooltip'}
          data-effect={'solid'}
          data-place={'left'}
          onClick={chevronsData.up.onClick}
          className={`move-item chevron-icon-up ${chevronsData.up.isDisabled ? 'is-disabled' : ''}`}>
          <Icon icon={'chevron-up'} />
        </div>
      }
      {
        chevronsData.down &&
        <div
          data-tip={chevronsData.down.isDisabled ? undefined : chevronsData.down.tooltip}
          data-for={'tooltip'}
          data-effect={'solid'}
          data-place={'left'}
          onClick={chevronsData.down.onClick}
          className={`move-item chevron-icon-down ${chevronsData.down.isDisabled ? 'is-disabled' : ''}`}>
          <Icon icon={'chevron-down'} />
        </div>
      }

      <div
        // onMouseUp={e => {console.log('up');e.preventDefault(); e.stopPropagation()}}
        // onMouseDown={e => {e.preventDefault(); e.stopPropagation()}}
        // onClick={e => {e.preventDefault(); e.stopPropagation()}}
        className={'move-item move-button'}
        data-for={'tooltip'}
        data-place={'left'}
        data-effect={'solid'}
        data-tip={moveComponentToolTip}>
        <MoveComponent />
      </div>
    </div>
  );
};


export default MovePad;
