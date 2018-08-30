import {v4 as generateId} from 'uuid';

import {createDefaultResource} from '../../../helpers/schemaUtils';

import {
  constants,
} from 'scholar-draft';

const {
  INLINE_ASSET,
} = constants;

export default (
  node,
  resources = [],
  activeSectionId,
) => {

  let resource;

  const url = node.getAttribute('href');
  const alt = node.getAttribute('alt');
  let title = node.getAttribute('title');
  if (!title || !alt || alt === 'href') {
    title = url;
  }
  if (!url || url.indexOf('#') === 0) {
    return {};
  }

  const existingResource = [...resources]
  .find(res =>
    res.metadata.type === 'webpage'
    && res.data.url === url
  );
  let resourceId;
  if (existingResource) {
    resourceId = existingResource.id;
  }
  else {
    resourceId = generateId();
    resource = {
      ...createDefaultResource(),
      id: resourceId,
      metadata: {
        type: 'webpage',
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
    type: 'webpage',
    // alias: text,
    insertionType: 'inline'
  };
  const contextualization = {
    id: contextualizationId,
    resourceId,
    contextualizerId,
    sectionId: activeSectionId,
    type: 'webpage',
  };

  const entity = {
    type: INLINE_ASSET,
    mutability: 'MUTABLE',
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
