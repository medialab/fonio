/**
 * This module helps to export the serialized content of a presentation to a distant server
 * @module fonio/utils/serverExporter
 */
import {post, del} from 'superagent';

import {serverUrl} from '../../secrets';

/**
 * @param {object} presentation - the presentation to publish to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export function publishToServer (story, dispatch, statusActionName) {
  return new Promise((resolve, reject) => {
    dispatch({
      type: statusActionName,
      log: 'publishing to server',
      status: 'processing'
    });
    const serverHTMLUrl = serverUrl + '/stories/' + story.id;
    story.metadata.serverHTMLUrl = serverHTMLUrl + '?format=html';
    post(serverHTMLUrl)
      .send(story)
      .end(err => {
          if (err) {
            return reject(err);
          }
          else {
            return resolve({
              storyId: story.id,
              status: 'ok'
            });
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
export function deleteStoryServer (id, dispatch, statusActionName) {
  return new Promise((resolve, reject) => {
    dispatch({
      type: statusActionName,
      log: 'delete story on server',
      status: 'processing'
    });
    const serverHTMLUrl = serverUrl + '/stories/' + id;
    const token = sessionStorage.getItem(id);
    if (!token || token === '')
      // TODO error
      return;
    del(serverHTMLUrl)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
      .end(err => {
          if (err) {
            return reject(err);
          }
          else {
            return resolve({status: 'ok'});
          }
        });
  });
}
