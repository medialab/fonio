/**
 * This module helps to export the serialized content of a presentation to a distant server
 * @module fonio/helpers/serverAuth
 */
import {put, post} from 'axios';
import {serverUrl} from '../../secrets';

/**
 * @param {object} story - the story to register to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @return {promise} actionPromise - a promise handling the attempt to register to server
 */
export function resetPasswordServer (id, oldPassword, newPassword) {
  const serverRequestUrl = serverUrl + '/auth/credential/' + id;
  return put(serverRequestUrl, {id, oldPassword, newPassword});
}

/**
 * @param {object} story - the story to register to server
 * @param {function} dispatch - the dispatch function to use to connect the process to redux logic
 * @return {promise} actionPromise - a promise handling the attempt to register to server
 */
export function loginToServer (id, password) {
  const serverRequestUrl = serverUrl + '/auth/login';
  return post(serverRequestUrl, {id, password});
}
