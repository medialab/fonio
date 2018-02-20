/**
 * This module helps to export the serialized content of a presentation to a distant server
 * @module fonio/utils/serverExporter
 */
import {get, put, post, del} from 'superagent';

import {serverUrl} from '../../secrets';

/**
 * @param {object} story
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function fetchStoriesServer () {
  return new Promise((resolve, reject) => {
    const serverRequestUrl = serverUrl + '/stories/';
    get(serverRequestUrl)
      .end((err, response) => {
          if (err) {
            return reject(err);
          }
          else {
            return resolve(JSON.parse(response.text));
          }
        });
    });
}
/**
 * @param {string} story id
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @return {promise} actionPromise - a promise handling the attempt to get the story with metadata structure
 */
export function getStoryServer (id) {
  return new Promise((resolve, reject) => {
    const serverRequestUrl = serverUrl + '/stories/' + id;
    get(serverRequestUrl)
      .end((err, response) => {
          if (err) {
            return reject(err);
          }
          else {
            return resolve(JSON.parse(response.text));
          }
        });
    });
}

/**
 * @param {string} id
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @return {promise} actionPromise - a promise handling the attempt to get all-in-one json story
 */
export function getStoryBundleServer(id, format) {
  return new Promise((resolve, reject) => {
    const serverRequestUrl = serverUrl + '/stories/' + id + '?format=' + format;
    get(serverRequestUrl)
      .end((err, response) => {
        if (err) {
          return reject(err);
        }
        else {
          if (format === 'json')
            return resolve(JSON.parse(response.text));
          else
            return resolve(response.text);
        }
      });
    });
}
/**
 * @param {object} story - the story to publish to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function createStoryServer (story, password) {
  return new Promise((resolve, reject) => {
    const serverRequestUrl = serverUrl + '/stories/';
    post(serverRequestUrl)
      .set('Accept', 'application/json')
      .send({
        story,
        password
      })
      .end((err, response) => {
          if (err) {
            return reject(err);
          }
          else {
            resolve(JSON.parse(response.text));
          }
        });
    });
}

/**
 * @param {object} story - the story to publish to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function saveStoryServer (story, token) {
    return new Promise((resolve, reject) => {
    const serverRequestUrl = serverUrl + '/stories/' + story.id;

    put(serverRequestUrl)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .send(story)
      .end(err => {
          if (err) {
            return reject(err);
          }
          else {
            return resolve(story);
          }
        });
    });
}

/**
 * @param {object} story - the story to publish to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function publishStoryBundleServer (id) {
  return new Promise((resolve, reject) => {
    const serverRequestUrl = serverUrl + '/stories/' + id + '?format=bundle';

    get(serverRequestUrl)
      .end((err, res) => {
          if (err) {
            return reject(err);
          }
          else {
            return resolve(res);
          }
        });
    });
}

/**
 * @param {string} story id  to delete on server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function deleteStoryServer (id, token) {
  return new Promise((resolve, reject) => {
    const serverRequestUrl = serverUrl + '/stories/' + id;
    del(serverRequestUrl)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .end((err, res) => {
          if (err) {
            return reject(err);
          }
          else {
            return resolve(res);
          }
        });
  });
}


/**
 * @param {object} resource upload to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function uploadResourceServer (storyId, id, resource, token) {
  return new Promise((resolve, reject) => {
    const serverRequestUrl = serverUrl + '/resources/' + storyId + '/' + id;
    put(serverRequestUrl)
      .set('x-access-token', token)
      .set('Accept', 'application/json')
      .send(resource)
      .end((err) => {
          if (err) {
            return reject(err);
          }
          else {
            return resolve(id);
          }
        });
    });
}

/**
 * @param {object} resource delete on server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function deleteResourceServer (storyId, resource, token) {
  return new Promise((resolve, reject) => {
    let filename = '';
    if (resource.metadata.type === 'image') {
      const ext = resource.metadata.mime.split('/')[1];
      filename = resource.metadata.id + '.' + ext;
    }
    else filename = resource.metadata.id + '.json';
    const serverRequestUrl = serverUrl + '/resources/' + storyId + '/' + filename;
    del(serverRequestUrl)
      .set('x-access-token', token)
      .end((err) => {
          if (err) {
            return reject(err);
          }
          else {
            return resolve(resource.metadata.id);
          }
        });
    });
}
