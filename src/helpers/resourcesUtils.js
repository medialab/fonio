/**
 * This module provides helpers to handle resource-related operations
 * @module bulgur/utils/resourcesUtils
 */

import {get} from 'axios';
import {csvParse} from 'd3-dsv';
import {v4 as genId} from 'uuid';
import Fuse from 'fuse.js';

import objectPath from 'object-path';

import resourceSchema from 'quinoa-schemas/resource';

import React from 'react';

import {renderToStaticMarkup} from 'react-dom/server';

import {Bibliography} from 'react-citeproc';
import english from 'raw-loader!../sharedAssets/bibAssets/english-locale.xml';
import apa from 'raw-loader!../sharedAssets/bibAssets/apa.csl';

import config from '../config';

import {validateResource, createDefaultResource} from './schemaUtils';
import {loadImage, inferMetadata, parseBibTeXToCSLJSON} from './assetsUtils';
import {getFileAsText} from './fileLoader';

const {restUrl} = config;

/**
 * Returns from server a list of all csl citation styles available in a light form
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationStylesListFromServer = () => {
  const endPoint = restUrl + '/citation-styles/';
  return get(endPoint);
};

/**
 * Returns from server the data associated with a given csl style
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationStyleFromServer = (styleId) => {
  const endPoint = restUrl + '/citation-styles/' + styleId;
  return get(endPoint);
};

/**
 * Returns from server a list of all csl citation languages available in a light form
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationLocalesListFromServer = () => {
  const endPoint = restUrl + '/citation-locales/';
  return get(endPoint);
};


/**
 * Returns from server a specific locale data
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationLocaleFromServer = (localeId) => {
  const endPoint = restUrl + '/citation-locales/' + localeId;
  return get(endPoint);
};

/**
 * Get title path for different resource by type from resource schema
 */

export const getResourceTitle = (resource) => {
  const titlePath = objectPath.get(resourceSchema, ['definitions', resource.metadata.type, 'title_path']);
  const title = titlePath ? objectPath.get(resource, titlePath) : resource.metadata.title;
  return title;
};


/**
 * fuzzy search resource object
 */
export const searchResources = (items, string) => {
  const options = {
    keys: ['metadata.title', 'data.name', 'data.title']
  };
  const fuse = new Fuse(items, options);
  return fuse.search(string);
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
              const bibData = {
                [datum.id]: datum
              };
              const htmlPreview = renderToStaticMarkup(<Bibliography items={bibData} style={apa} locale={english} />);
              resource = {
                ...createDefaultResource(),
                id,
                metadata: {
                  ...createDefaultResource().metadata,
                  type: 'bib',
                },
                data: [{...datum, htmlPreview}],
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

