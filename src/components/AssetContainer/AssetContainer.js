/**
 * This module provides a wrapper for displaying assets in fonio editor
 * @module fonio/components/AssetContainer
 */

import React, {PropTypes} from 'react';
import Textarea from 'react-textarea-autosize';
import AssetPreview from '../AssetPreview/AssetPreview';

import {translateNameSpacer} from '../../helpers/translateUtils';

import {
  Entity,
} from 'draft-js';

import './AssetContainer.scss';

const AssetContainer = ({
  block,
  blockProps
}, context) => {

  const translate = translateNameSpacer(context.t, 'Components.AssetContainer');

  const entityId = block.getEntityAt(0);
  if (entityId === null) {
    return null;
  }
  const entity = Entity.get(entityId);
  const assetId = entity.getData().id;
  const {
    assets,
    updateAsset,
    storyId,
    toggleReadonly
  } = blockProps;
  const asset = assets[assetId];

  if (!asset) {
    return null;
  }

  const {metadata, data} = asset;

  const updateMetadataField = (key, value) => {
    const newAsset = {
      ...asset,
      metadata: {
        ...asset.metadata,
        [key]: value
      }
    };
    updateAsset(storyId, assetId, newAsset);
  };
  const onTitleChange = e => updateMetadataField('title', e.target.value);
  const onDescriptionChange = e => updateMetadataField('description', e.target.value);
  const onSourceChange = e => updateMetadataField('source', e.target.value);
  const onElementFocus = () => {
    toggleReadonly(true);
  };
  const onElementBlur = () => {
    toggleReadonly(false);
  };
  const onScroll = e => {
    e.stopPropagation();
  };
  return (
    <figure
      className={'fonio-asset-container ' + metadata.type}
      onMouseLeave={onElementBlur}
      onScroll={onScroll}>
      <div
        className="figure-container"
        onMouseEnter={onElementFocus}
        onMouseLeave={onElementBlur}>
        <AssetPreview type={metadata.type} data={data} />
      </div>
      <figcaption>
        <input
          onFocus={onElementFocus}
          onBlur={onElementBlur}
          value={metadata.title}
          onChange={onTitleChange}
          placeholder={translate('title')} />
        <Textarea
          onFocus={onElementFocus}
          onBlur={onElementBlur}
          value={metadata.description}
          onChange={onDescriptionChange}
          placeholder={translate('description')} />
        <div className="source-container">
          <span>{translate('source')} :</span>
          <input
            onFocus={onElementFocus}
            onBlur={onElementBlur}
            value={metadata.source}
            onChange={onSourceChange}
            placeholder={translate('source')} />
        </div>
      </figcaption>
    </figure>
  );
};

AssetContainer.contextTypes = {
    t: PropTypes.func.isRequired
};

export default AssetContainer;
