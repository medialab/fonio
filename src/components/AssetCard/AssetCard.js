/**
 * This module provides a reusable big select element component
 * @module fonio/components/BigSelect
 */
import React, {PropTypes} from 'react';
import {translateNameSpacer} from '../../helpers/translateUtils';

import './AssetCard.scss';

const AssetCard = ({
  metadata,
  onDelete,
  onConfigure
}, context) => {
  const translate = translateNameSpacer(context.t, 'Components.AssetCard');
  const onDeleteClick = () => onDelete();
  const onConfigureClick = () => onConfigure();
  return (
    <li className="fonio-asset-card">
      <div className="card-header">
        <img src={require('./assets/' + metadata.type + '.svg')} />
        <h5>
          <span className="title">{metadata.title && metadata.title.length ? metadata.title : translate('untitled-asset')}</span>
        </h5>
      </div>
      <div className="card-body">
        <div className="info-column">
          <p className="description">
            {metadata.description && metadata.description.length ? metadata.description : translate('no-description')}
          </p>
        </div>
        <div className="buttons-column" />
      </div>
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
