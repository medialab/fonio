/**
 * This module provides a wrapper for displaying assets in fonio editor
 * @module fonio/components/ResourceContainer
 */

import React from 'react';
import PropTypes from 'prop-types';
// import Textarea from 'react-textarea-autosize';
import AssetPreview from '../AssetPreview/AssetPreview';

// import {translateNameSpacer} from '../../helpers/translateUtils';

import './ResourceContainer.scss';

const ResourceContainer = ({
  block,
  blockProps
}/*, context*/) => {

  const {
    assets,
    // updateResource,
    // storyId,
    toggleReadonly,
    currentContent
  } = blockProps;

  // const translate = translateNameSpacer(context.t, 'Components.ResourceContainer');
  const entityId = block.getEntityAt(0);
  if (entityId === null) {
    return null;
  }
  const entity = currentContent.getEntity(entityId);// Entity.get(entityId);
  const assetId = entity.getData().id;

  const asset = assets[assetId];

  if (!asset) {
    return null;
  }

  const {
    metadata,
    data
  } = asset;

  // const updateMetadataField = (key, value) => {
  //   const newResource = {
  //     ...asset,
  //     metadata: {
  //       ...asset.metadata,
  //       [key]: value
  //     }
  //   };
  //   updateResource(storyId, assetId, newResource);
  // };

  // const onTitleChange = e => updateMetadataField('title', e.target.value);
  // const onDescriptionChange = e => updateMetadataField('description', e.target.value);
  // const onSourceChange = e => updateMetadataField('source', e.target.value);
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
      className={'fonio-ResourceContainer ' + metadata.type}
      onMouseLeave={onElementBlur}
      onScroll={onScroll}>
      <div
        className="figure-container"
        onMouseEnter={onElementFocus}
        onMouseLeave={onElementBlur}>
        <AssetPreview
          type={metadata.type}
          data={data} />
      </div>
      <figcaption>
        <p>
          {metadata.title}
        </p>
        {metadata.source && metadata.source.length > 0 && <p>
          <i>{metadata.source}</i>
        </p>}
        {/*<input
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
          placeholder={translate('description')}
        />
        <div className="source-container">
          <span>{translate('source')} :</span>
          <input
            onFocus={onElementFocus}
            onBlur={onElementBlur}
            value={metadata.source}
            onChange={onSourceChange}
            placeholder={translate('source')}
          />
        </div>*/}
      </figcaption>
    </figure>
  );
};

ResourceContainer.contextTypes = {
    t: PropTypes.func.isRequired
};

export default ResourceContainer;
