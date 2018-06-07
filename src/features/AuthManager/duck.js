/**
 * This module exports logic-related elements for the fonio story manager
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StoryManager
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';


/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
const SET_STORY_LOGIN_ID = 'SET_STORY_LOGIN_ID';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setStoryLoginId = payload => ({
  type: SET_STORY_LOGIN_ID,
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
      const propName = getStatePropFromActionSet(action.type);
      return {
        ...state,
        [propName]: payload
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

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  storyLoginId,
});
