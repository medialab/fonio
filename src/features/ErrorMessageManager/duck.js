/**
 * This module exports logic-related elements for the fonio story manager
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/ErrorMessageManager
 */
import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';

import {LOGIN_STORY, ENTER_BLOCK} from '../ConnectionsManager/duck';
import {FETCH_STORIES, CREATE_STORY, OVERRIDE_STORY, IMPORT_STORY, DUPLICATE_STORY, DELETE_STORY, CHANGE_PASSWORD} from '../HomeView/duck';
import {ACTIVATE_STORY, UPLOAD_RESOURCE, DELETE_UPLOADED_RESOURCE, DELETE_SECTION, DELETE_RESOURCE} from '../StoryManager/duck';

const FAIL_DEFAULT_STATE = {
  requestFail: undefined,
  lastLockFail: undefined,
};
const fails = (state = FAIL_DEFAULT_STATE, action) => {
  const {payload} = action;
  switch (action.type) {
    /**
     * Errors and failures management
     */
    case `${FETCH_STORIES}_FAIL`:
    case `${CREATE_STORY}_FAIL`:
    case `${OVERRIDE_STORY}_FAIL`:
    case `${IMPORT_STORY}_FAIL`:
    case `${DUPLICATE_STORY}_FAIL`:
    case `${DELETE_STORY}_FAIL`:
    case `${LOGIN_STORY}_FAIL`:
    case `${CHANGE_PASSWORD}_FAIL`:
    case `${ACTIVATE_STORY}_FAIL`:
    case `${UPLOAD_RESOURCE}_FAIL`:
    case `${DELETE_UPLOADED_RESOURCE}_FAIL`:
    case 'SAVE_STORY_FAIL':
      return {
        ...state,
        requestFail: action.type
      };

    case `${ENTER_BLOCK}_FAIL`:
      return {
        ...state,
        lastLockFail: {
          ...payload,
          mode: 'enter',
        },
      };
    case `${DELETE_RESOURCE}_FAIL`:
      return {
        ...state,
        lastLockFail: {
          ...payload,
          mode: 'delete',
          blockType: 'resources'
        },
      };
    case `${DELETE_SECTION}_FAIL`:
      return {
        ...state,
        lastLockFail: {
          ...payload,
          mode: 'delete',
          blockType: 'sections'
        },
      };
    default:
      return state;
  }
};

const requestFail = state => state.fails.requestFail;
const lastLockFail = state => state.fails.lastLockFail;

export default combineReducers({
  fails,
});

export const selector = createStructuredSelector({
  requestFail,
  lastLockFail,
});

