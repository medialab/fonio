/**
 * This module provides helpers to handle resource-related operations
 * @module bulgur/utils/resourcesUtils
 */

import {get} from 'axios';
import {csvParse} from 'd3-dsv';
import {v4 as genId} from 'uuid';

import {validateResource, createDefaultResource} from './schemaUtils';
import {loadImage, inferMetadata, parseBibTeXToCSLJSON} from './assetsUtils';
import {getFileAsText} from './fileLoader';

const {apiUrl} = CONFIG;

/**
 * Returns from server a list of all csl citation styles available in a light form
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationStylesListFromServer = () => {
  const endPoint = apiUrl + '/citation-styles/';
  return get(endPoint);
};

/**
 * Returns from server the data associated with a given csl style
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationStyleFromServer = (styleId) => {
  const endPoint = apiUrl + '/citation-styles/' + styleId;
  return get(endPoint);
};

/**
 * Returns from server a list of all csl citation languages available in a light form
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationLocalesListFromServer = () => {
  const endPoint = apiUrl + '/citation-locales/';
  return get(endPoint);
};


/**
 * Returns from server a specific locale data
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationLocaleFromServer = (localeId) => {
  const endPoint = apiUrl + '/citation-locales/' + localeId;
  return get(endPoint);
};

/**
 * Generate resource data from file and props
 */
export const createResourceData = (file, props) =>
  new Promise((resolve) => {
    const {
      userId,
      editedStory: story,
    } = props;
    const {
      id: storyId
    } = story;
    let id = genId();
    const extension = file.name.split('.').pop();
    let metadata;
    let data;
    let type;
    let resource;
    let payload;
    switch (extension) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        type = 'image';
        return loadImage(file)
          .then((base64) => {
            data = {base64};
            metadata = inferMetadata({...data, file}, type);
            resource = {
              ...createDefaultResource(),
              id,
              metadata: {
                ...metadata,
                type,
              },
              data,
            };
            payload = {
              resourceId: id,
              resource,
              storyId,
              userId,
            };
            if (validateResource(resource).valid) {
              props.actions.uploadResource(payload, 'create');
            }
            else resolve({id, success: false, error: validateResource(resource).errors});
          })
          .then(() => resolve({id, success: true}))
          .catch((error) => resolve({id, success: false, error}));
      case 'csv':
      case 'tsv':
        type = 'table';
        return getFileAsText(file)
          .then((text) => {
            data = {json: csvParse(text)};
            metadata = inferMetadata({...data, file}, type);
            resource = {
              ...createDefaultResource(),
              id,
              metadata: {
                ...metadata,
                type,
              },
              data,
            };
            payload = {
              resourceId: id,
              resource,
              storyId,
              userId,
            };
            if (validateResource(resource).valid) {
              props.actions.uploadResource(payload, 'create');
            }
            else resolve({id, success: false, error: validateResource(resource).errors});
          })
          .then(() => resolve({id, success: true}))
          .catch((error) => resolve({id, success: false, error}));
      default:
        return getFileAsText(file)
          .then((text) => {
            data = parseBibTeXToCSLJSON(text);
            data.forEach(datum => {
              id = genId();
              resource = {
                ...createDefaultResource(),
                id,
                metadata: {
                  ...createDefaultResource().metadata,
                  type: 'bib',
                },
                data: [datum],
              };
              payload = {
                resourceId: id,
                resource,
                storyId,
                userId,
              };
              if (validateResource(resource).valid) {
                props.actions.createResource(payload);
              }
              else resolve({id, success: false, error: validateResource(resource).errors});
            });
          })
          .then(() => resolve({id, success: true}))
          .catch((error) => resolve({id, success: false, error}));
    }
  });

