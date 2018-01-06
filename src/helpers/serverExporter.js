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
    const serverHTMLUrl = serverUrl + '/stories/';
    get(serverHTMLUrl)
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
 * @param {object} story
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function getStoryServer (id) {
  return new Promise((resolve, reject) => {
    const serverHTMLUrl = serverUrl + '/stories/' + id;
    get(serverHTMLUrl)
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
 * @param {object} story - the story to publish to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function createStoryServer (story) {
  return new Promise((resolve, reject) => {
    const serverHTMLUrl = serverUrl + '/stories';
    post(serverHTMLUrl)
      .set('Accept', 'application/json')
      .send(story)
      .end(err => {
          if (err) {
            return reject(err);
          }
          else {
            resolve(story);
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
export function publishToServer (story, token) {
  return new Promise((resolve, reject) => {
    const serverHTMLUrl = serverUrl + '/stories/' + story.id;
    story.metadata.serverHTMLUrl = serverHTMLUrl + '?format=html';
    story.metadata.serverJSONUrl = serverHTMLUrl;

    put(serverHTMLUrl)
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
 * @param {string} story id  to delete on server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function deleteStoryServer (id, token) {
  return new Promise((resolve, reject) => {
    const serverHTMLUrl = serverUrl + '/stories/' + id;
    del(serverHTMLUrl)
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
