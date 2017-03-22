/**
 * This module helps to export the serialized content of a presentation to a distant server
 * @module fonio/utils/serverExporter
 */
import {patch} from 'superagent';

import {serverUrl} from '../../secrets';

/**
 * @param {object} presentation - the presentation to publish to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to publish to server
 */
export default function publishToServer (presentation, dispatch, statusActionName) {
  return new Promise((resolve, reject) => {
    dispatch({
      type: statusActionName,
      log: 'publishing to server',
      status: 'processing'
    });
    const serverHTMLUrl = serverUrl + '/presentations/' + presentation.id;
    presentation.metadata.serverHTMLUrl = serverHTMLUrl + '?format=html';
    patch(serverHTMLUrl)
      .send(presentation)
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
