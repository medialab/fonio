/**
 * This module provides helpers to handle resource-related operations
 * @module bulgur/utils/resourcesUtils
 */

import {get} from 'axios';

const {serverUrl} = CONFIG;/* eslint no-undef : 0 */

/**
 * Returns from server a list of all csl citation styles available in a light form
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationStylesListFromServer = () => {
  const endPoint = serverUrl + '/citation-styles/';
  return get(endPoint);
};

/**
 * Returns from server the data associated with a given csl style
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationStyleFromServer = (styleId) => {
  const endPoint = serverUrl + '/citation-styles/' + styleId;
  return get(endPoint);
};

/**
 * Returns from server a list of all csl citation languages available in a light form
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationLocalesListFromServer = () => {
  const endPoint = serverUrl + '/citation-locales/';
  return get(endPoint);
};


/**
 * Returns from server a specific locale data
 * @return {Promise} resolver - promise wrapping the request
 */
export const getCitationLocaleFromServer = (localeId) => {
  const endPoint = serverUrl + '/citation-locales/' + localeId;
  return get(endPoint);
};
