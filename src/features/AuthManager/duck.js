/**
 * This module exports logic-related elements for the fonio story manager
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StoryManager
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';

import {LOGIN_STORY} from '../ConnectionsManager/duck';
import {CHANGE_PASSWORD} from '../HomeView/duck';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
const SET_STORY_LOGIN_ID = 'SET_STORY_LOGIN_ID';
const SET_LOGIN_STATUS = 'SET_LOGIN_STATUS';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setStoryLoginId = payload => ({
  type: SET_STORY_LOGIN_ID,
  payload
});

export const setLoginStatus = payload => ({
  type: SET_LOGIN_STATUS,
  payload
});

/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */

const getStatePropFromActionSet = actionName => {
  return actionName.replace('SET_', '').toLowerCase().replace(/(_[a-z])/gi, (a, b) => b.substr(1).toUpperCase());
};

const UI_DEFAULT_STATE = {
  /**
   * id of the story being asked to be logged in
   */
  storyLoginId: undefined,

  /**
   * status of the login process (['processing', 'fail', 'success'])
   */
  loginStatus: undefined,

  /**
   * status of the change password process (['processing', 'fail', 'success'])
   */
  changePasswordStatus: undefined,

};

/**
 * This redux reducer handles the state of the ui
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function ui(state = UI_DEFAULT_STATE, action) {
  const {payload} = action;
  switch (action.type) {
    case SET_STORY_LOGIN_ID:
    case SET_LOGIN_STATUS:
      const propName = getStatePropFromActionSet(action.type);
      return {
        ...state,
        [propName]: payload
      };
    case LOGIN_STORY:
      return {
        ...state,
        loginStatus: 'processing'
      };
    case `${LOGIN_STORY}_SUCCESS`:
      return {
        ...state,
        loginStatus: undefined,
        storyLoginId: undefined,
      };
    case `${LOGIN_STORY}_FAIL`:
      return {
        ...state,
        loginStatus: 'fail'
      };
    case `${CHANGE_PASSWORD}_SUCCESS`:
      return {
        ...state,
        changePasswordStatus: undefined,
      };
    case `${CHANGE_PASSWORD}_FAIL`:
      return {
        ...state,
        changePasswordStatus: 'fail'
      };
    default:
      return state;
  }
}

/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers({
  ui
});

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */
const storyLoginId = state => state.ui.storyLoginId;
const loginStatus = state => state.ui.loginStatus;
const changePasswordStatus = state => state.ui.changePasswordStatus;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  storyLoginId,
  loginStatus,
  changePasswordStatus,
});
