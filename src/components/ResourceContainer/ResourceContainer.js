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


/**
 * Renders the ResourceContainer component as a pure function
 * @param {object} props - used props (see prop types below)
 * @return {ReactElement} component - the resulting component
 */
const ResourceContainer = ({
  block,
  blockProps
}/*, context*/) => {

  const {
    assets,
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
        {// uncomment if you want to enable inline
        // resource metadata edition
        /*<input
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

/**
 * Component's properties types
 */
ResourceContainer.propTypes = {

  /**
   * Draft-js BlockContents Immutable object
   */
  block: PropTypes.object,

  /**
   * Props passed to the block element
   */
  blockProps: PropTypes.shape({

    /**
     * Map of available assets
     */
    assets: PropTypes.object,

    /**
     * Current draft-js content state
     */
    currentContent: PropTypes.object,

    /**
     * Callbacks when block asks to switch to readOnly mode
     */
    toggleReadonly: PropTypes.func,
  }),
};


/**
 * Component's context used properties
 */
// ResourceContainer.contextTypes = {
//
     /**
//      * Un-namespaced translate function
//      */
//     t: PropTypes.func.isRequired
// };

export default ResourceContainer;
