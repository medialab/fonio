/**
 * This module helps to export the serialized content of a presentation to a distant server
 * @module fonio/helpers/serverAuth
 */
import {put, post, del} from 'superagent';

import {serverUrl} from '../../secrets';

/**
 * @param {object} storyCredential - the story id password to register to server
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to register to server
 */
export function createCredentialServer (id, password) {
  return new Promise((resolve, reject) => {
    const serverRequestUrl = serverUrl + '/auth/credential';
    post(serverRequestUrl)
      .set('Accept', 'application/json')
      .send({id, password})
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
 * @param {object} id - story id to deleete
 * @param {object} token - access token
 * @return {promise} actionPromise - a promise handling the attempt to register to server
 */
export function deleteCredentialServer (id, token) {
  return new Promise((resolve, reject) => {
    const serverRequestUrl = serverUrl + '/auth/credential/' + id;
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
 * @param {object} story - the story to register to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @param {string} statusActionName - the name base of the actions to dispatch
 * @return {promise} actionPromise - a promise handling the attempt to register to server
 */
export function resetPasswordServer (id, oldPassword, newPassword) {
  return new Promise((resolve, reject) => {
    const serverRequestUrl = serverUrl + '/auth/credential/' + id;
    put(serverRequestUrl)
      .set('Accept', 'application/json')
      .send({id, oldPassword, newPassword})
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
export function loginToServer (id, password) {
  return new Promise((resolve, reject) => {
    const serverRequestUrl = serverUrl + '/auth/login';
    post(serverRequestUrl)
      .set('Accept', 'application/json')
      .send({id, password})
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
