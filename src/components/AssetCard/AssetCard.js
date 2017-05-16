/**
 * This module provides a reusable big select element component
 * @module fonio/components/BigSelect
 */
import React from 'react';
import PropTypes from 'prop-types';
import {translateNameSpacer} from '../../helpers/translateUtils';

import './AssetCard.scss';

const AssetCard = ({
  metadata,
  onDelete,
  onConfigure,
  selectMode,
  onSelect
}, context) => {
  const translate = translateNameSpacer(context.t, 'Components.AssetCard');
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
       // console.log('start drag', metadata);
       e.dataTransfer.dropEffect = 'move';
       // e.dataTransfer.setData('text/plain', 'DRAFTJS_BLOCK_TYPE:' + metadata.type.toUpperCase());
       e.dataTransfer.setData('text', 'DRAFTJS_ASSET_ID:' + metadata.id);
   };
  return (
    <li
      draggable
      onDragStart={startDrag}
      className={'fonio-asset-card' + (selectMode ? ' select-mode' : '')}
      onClick={onGlobalClick}>
      <div
        className="card-header">
        <img src={require('./assets/' + metadata.type + '.svg')} />
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
          <img src={require('./assets/settings.svg')} className="fonio-icon-image" />
          {translate('settings')}
        </button>
        <button className={'delete-btn '} onClick={onDeleteClick}>
          <img src={require('./assets/close.svg')} className="fonio-icon-image" />
          {translate('delete')}
        </button>
      </div>
    </li>
  );
};

AssetCard.contextTypes = {
  t: PropTypes.func.isRequired
};

export default AssetCard;
