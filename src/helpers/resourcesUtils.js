/**
 * This module provides helpers to handle resource-related operations
 * @module bulgur/utils/resourcesUtils
 */

import {
  get
} from 'superagent';

import {serverUrl} from '../../secrets';


/**
 * Returns from server a list of all csl citation styles available in a light form
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationStylesListFromServer = () => {
  return new Promise((resolve, reject) => {
    const endPoint = serverUrl + '/citation-styles/';
    get(endPoint)
    .end((error, res) => {
      if (error) {
        reject(error);
      }
      else {
        resolve(res.body);
      }
    });
  });
};

/**
 * Returns from server the data associated with a given csl style
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationStyleFromServer = (styleId) => {
  return new Promise((resolve, reject) => {
    const endPoint = serverUrl + '/citation-styles/' + styleId;
    get(endPoint)
    .end((error, res) => {
      if (error) {
        reject(error);
      }
      else {
        resolve(res.body);
      }
    });
  });
};

/**
 * Returns from server a list of all csl citation languages available in a light form
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationLocalesListFromServer = () => {
  return new Promise((resolve, reject) => {
    const endPoint = serverUrl + '/citation-locales/';
    get(endPoint)
    .end((error, res) => {
      if (error) {
        reject(error);
      }
      else {
        resolve(res.body);
      }
    });
  });
};


/**
 * Returns from server a specific locale data
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationLocaleFromServer = (localeId) => {
  return new Promise((resolve, reject) => {
    const endPoint = serverUrl + '/citation-locales/' + localeId;
    get(endPoint)
    .end((error, res) => {
      if (error) {
        reject(error);
      }
      else {
        resolve(res.body);
      }
    });
  });
};
