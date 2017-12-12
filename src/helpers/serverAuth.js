/**
 * This module helps to export the serialized content of a presentation to a distant server
 * @module fonio/helpers/serverAuth
 */
import {post, get} from 'superagent';

import {serverUrl} from '../../secrets';

/**
 * @param {object} story - the story to register to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to register to server
 */
export function registerToServer (storyCredential, dispatch, statusActionName) {
  return new Promise((resolve, reject) => {
    dispatch({
      type: statusActionName,
      log: 'register to server',
      status: 'processing'
    });

    const serverHTMLUrl = serverUrl + '/auth/register';
    post(serverHTMLUrl)
      .set('Accept', 'application/json')
      .send(storyCredential)
      .end((err, response) => {
          if (err) {
            return reject(err);
          }
          else {
            const jsonResp = JSON.parse(response.text);
            const accessToken = jsonResp.token;
            resolve(accessToken);
          }
        });
    });
}

/**
 * @param {object} story - the story to register to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to register to server
 */
export function loginToServer (story, dispatch, statusActionName) {
  return new Promise((resolve, reject) => {
    dispatch({
      type: statusActionName,
      log: 'login to server',
      status: 'processing'
    });
    const serverHTMLUrl = serverUrl + '/auth/login';
    post(serverHTMLUrl)
      .set('Accept', 'application/json')
      .send(story)
      .end((err, response) => {
          if (err) {
            return reject(err);
          }
          else {
            const jsonResp = JSON.parse(response.text);
            const accessToken = jsonResp.token;
            resolve(accessToken);
          }
        });
    });
}

/**
 * @param {string} token - reauth the token to verify at server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to register to server
 */
export function tokenVerify(token, dispatch, statusActionName) {
    return new Promise((resolve, reject) => {
    dispatch({
      type: statusActionName,
      log: 'verify token from server',
      status: 'processing'
    });
    const serverHTMLUrl = serverUrl + '/auth/me';
    get(serverHTMLUrl)
      .set('Accept', 'application/json')
      .set('x-access-token', token)
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
