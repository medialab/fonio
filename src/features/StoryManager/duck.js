/**
 * This module exports logic-related elements for the fonio story manager
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StoryManager
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';

import {get/*, put, post, delete as del*/} from 'axios';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
const ACTIVATE_STORY = 'ACTIVATE_STORY';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const activateStory = payload => ({
  type: ACTIVATE_STORY,
  payload,
  promise: () => {
    const {storyId, userId, token} = payload;
    const serverRequestUrl = `${CONFIG.serverUrl}/stories/${storyId}?userId=${userId}&edit=true`;/* eslint no-undef : 0 */
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    return get(serverRequestUrl, options);
  },
});


/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */

const STORY_DEFAULT_STATE = {
};

/**
 * This redux reducer handles the state of edited story
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function story(state = STORY_DEFAULT_STATE, action) {
  const {result} = action;
  switch (action.type) {
    case `${ACTIVATE_STORY}_SUCCESS`:
      return result.data;
    default:
      return state;
  }
}

/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers({
  story
});

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */

const editedStory = state => state.story;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  editedStory
});
