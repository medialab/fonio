/**
 * This module helps to export the serialized content of a presentation to a distant server
 * @module fonio/utils/serverExporter
 */
import {get, put, post, delete as del} from 'axios';
const {apiUrl} = CONFIG;/* eslint no-undef : 0 */

/**
 * @param {object} story
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function fetchStoriesServer () {
  const serverRequestUrl = apiUrl + '/stories/';
  return get(serverRequestUrl);
}
/**
 * @param {string} story id
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @return {promise} actionPromise - a promise handling the attempt to get the story with metadata structure
 */
export function getStoryServer (id) {
  const serverRequestUrl = apiUrl + '/stories/' + id;
  return get(serverRequestUrl);
}

/**
 * @param {string} id
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @return {promise} actionPromise - a promise handling the attempt to get all-in-one json story
 */
export function getStoryBundleServer(id, format) {
  const serverRequestUrl = apiUrl + '/stories/' + id + '?format=' + format;
  return get(serverRequestUrl);
}
/**
 * @param {object} story - the story to publish to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function createStoryServer (story, password) {
  const serverRequestUrl = apiUrl + '/stories/';
  return post(serverRequestUrl, {story, password});
}

/**
 * @param {object} story - the story to publish to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function saveStoryServer (story, token) {
  const serverRequestUrl = apiUrl + '/stories/' + story.id;
  const options = {
    headers: {
      'x-access-token': token
    }
  };
  return put(serverRequestUrl, story, options);
}

/**
 * @param {object} story - the story to publish to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function publishStoryBundleServer (id) {
  const serverRequestUrl = apiUrl + '/stories/' + id + '?format=bundle';
  return get(serverRequestUrl);
}

/**
 * @param {string} story id  to delete on server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function deleteStoryServer (id, token) {
  const serverRequestUrl = apiUrl + '/stories/' + id;
  const options = {
    headers: {
      'x-access-token': token
    }
  };
  return del(serverRequestUrl, options);
}


/**
 * @param {object} resource upload to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function uploadResourceServer (storyId, id, resource, token) {
  const serverRequestUrl = apiUrl + '/resources/' + storyId + '/' + id;
  const options = {
    headers: {
      'x-access-token': token
    }
  };
  return put(serverRequestUrl, resource, options);
}

/**
 * @param {object} resource delete on server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function deleteResourceServer (storyId, resource, token) {
  let filename = '';
  if (resource.metadata.type === 'image') {
    const ext = resource.metadata.mime.split('/')[1];
    filename = resource.metadata.id + '.' + ext;
  }
  else filename = resource.metadata.id + '.json';
  const serverRequestUrl = apiUrl + '/resources/' + storyId + '/' + filename;
  const options = {
    headers: {
      'x-access-token': token
    }
  };
  return del(serverRequestUrl, options);
}
