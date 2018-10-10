/**
 * This module provides the logic for handling an image pasting
 * @module fonio/components/SectionEditor
 */
import { v4 as generateId } from 'uuid';

import { createDefaultResource } from '../../../helpers/schemaUtils';

import {
  constants,
} from 'scholar-draft';

const {
  BLOCK_ASSET,
} = constants;

export default (
  node,
  resources = [],
  activeSectionId,
) => {

  let resource;

  const url = node.getAttribute( 'src' );
  let title = node.getAttribute( 'title' );
  const alt = node.getAttribute( 'alt' );
  if ( !title || !alt || alt === 'href' ) {
    title = url;
  }
  if ( !url || url.indexOf( 'http' ) !== 0 ) {
    return {};
  }

  const existingResource = [ ...resources ]
  .find( ( res ) =>
    res.metadata.type === 'image'
    && res.data.url === url
  );
  let resourceId;
  if ( existingResource ) {
    resourceId = existingResource.id;
  }
  else {
    resourceId = generateId();
    resource = {
      ...createDefaultResource(),
      id: resourceId,
      metadata: {
        type: 'image',
        createdAt: new Date().getTime(),
        lastModifiedAt: new Date().getTime(),
        title,
      },
      data: {
        url,
      }
    };
  }
  const contextualizerId = generateId();
  const contextualizationId = generateId();
  const contextualizer = {
    id: contextualizerId,
    type: 'image',
    insertionType: 'block'
  };
  const contextualization = {
    id: contextualizationId,
    resourceId,
    contextualizerId,
    sectionId: activeSectionId,
    type: 'image',
  };

  const entity = {
    type: BLOCK_ASSET,
    mutability: 'IMMUTABLE',
    data: {
      asset: {
        id: contextualizationId
      }
    }
  };

  return {
    resource,
    contextualizer,
    contextualization,
    entity,
  };
};
