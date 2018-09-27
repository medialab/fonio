/**
 * This module exports logic-related elements for handling errors in the application
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/ErrorMessage
 */
import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';

import {
  // LOGIN_STORY,
  ENTER_BLOCK
} from '../ConnectionsManager/duck';
import { FETCH_STORIES,
  CREATE_STORY,
  OVERRIDE_STORY,
  IMPORT_STORY,
  DUPLICATE_STORY,
  DELETE_STORY,
  CHANGE_PASSWORD
} from '../HomeView/duck';
import {
  ACTIVATE_STORY,
  CREATE_RESOURCE,
  UPDATE_RESOURCE,
  UPLOAD_RESOURCE,
  DELETE_UPLOADED_RESOURCE,
  DELETE_RESOURCE,
  UPDATE_STORY_METADATA,
  UPDATE_STORY_SETTINGS,
  UPDATE_SECTIONS_ORDER,
  SET_SECTION_LEVEL,
  CREATE_SECTION,
  UPDATE_SECTION,
  DELETE_SECTION,
  CREATE_CONTEXTUALIZATION,
  UPDATE_CONTEXTUALIZATION,
  DELETE_CONTEXTUALIZATION,
  CREATE_CONTEXTUALIZER,
  UPDATE_CONTEXTUALIZER,
  DELETE_CONTEXTUALIZER
} from '../StoryManager/duck';

export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE';

export const CONNECT_ERROR = 'CONNECT_ERROR';
export const RECONNECT = 'RECONNECT';

export const SET_BROWSER_WARNING = 'SET_BROWSER_WARNING';

const CLEAR_ERROR_MESSAGES = 'CLEAR_ERROR_MESSAGES';

export const setErrorMessage = ( payload ) => ( {
  type: SET_ERROR_MESSAGE,
  payload
} );

export const clearErrorMessages = () => ( {
  type: CLEAR_ERROR_MESSAGES
} );

export const setBrowserWarning = ( payload ) => ( {
  type: SET_BROWSER_WARNING,
  payload
} );

const FAIL_DEFAULT_STATE = {
  requestFail: undefined,
  lastLockFail: undefined,
  needsReload: false,
  connectError: false,
  lastError: undefined,
  malformedStoryError: undefined,
  browserWarning: undefined,
};
const fails = ( state = FAIL_DEFAULT_STATE, action ) => {
  const { payload } = action;
  let needsReload = false;
  switch ( action.type ) {
    case CLEAR_ERROR_MESSAGES:
      return FAIL_DEFAULT_STATE;
    case CONNECT_ERROR:
      return {
        ...state,
        connectError: true
      };
    case RECONNECT:
      return {
        ...state,
        connectError: false
      };

    /**
     * Errors and failures management
     */
    case SET_ERROR_MESSAGE:
      return {
        ...state,
        requestFail: payload.type,
        needsReload,
        lastError: action.payload,
        lastErrorTime: new Date().getTime()
      };
    case 'SAVE_STORY_FAIL':
      needsReload = true; /* eslint no-fallthrough : 0 */
    case `${FETCH_STORIES}_FAIL`:
    case `${CREATE_STORY}_FAIL`:
    case `${OVERRIDE_STORY}_FAIL`:
    case `${IMPORT_STORY}_FAIL`:
    case `${DUPLICATE_STORY}_FAIL`:
    case `${DELETE_STORY}_FAIL`:
    // case `${LOGIN_STORY}_FAIL`:
    case `${CHANGE_PASSWORD}_FAIL`:
    case `${CREATE_RESOURCE}_FAIL`:
    case `${UPDATE_RESOURCE}_FAIL`:
    case `${UPLOAD_RESOURCE}_FAIL`:
    case `${DELETE_UPLOADED_RESOURCE}_FAIL`:
    case `${UPDATE_STORY_METADATA}_FAIL`:
    case `${UPDATE_STORY_SETTINGS}_FAIL`:
    case `${UPDATE_SECTIONS_ORDER}_FAIL`:
    case `${SET_SECTION_LEVEL}_FAIL`:
    case `${CREATE_SECTION}_FAIL`:
    case `${UPDATE_SECTION}_FAIL`:
    case `${CREATE_CONTEXTUALIZATION}_FAIL`:
    case `${UPDATE_CONTEXTUALIZATION}_FAIL`:
    case `${DELETE_CONTEXTUALIZATION}_FAIL`:
    case `${CREATE_CONTEXTUALIZER}_FAIL`:
    case `${UPDATE_CONTEXTUALIZER}_FAIL`:
    case `${DELETE_CONTEXTUALIZER}_FAIL`:
      // TODO: Need to find a better way to display this validation error in toaster
      console.error( action );/* eslint no-console : 0 */
      return {
        ...state,
        requestFail: action.type,
        needsReload,
        lastError: action.payload || { error: action.error },
        lastErrorTime: new Date().getTime()
      };

    case `${ENTER_BLOCK}_FAIL`:
      return {
        ...state,
        lastLockFail: {
          ...payload,
          mode: 'enter',
        },
        lastErrorTime: new Date().getTime()
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
        lastErrorTime: new Date().getTime()
      };
    case `${ACTIVATE_STORY}_FAIL`:
      if ( action.error && action.error.response && action.error.response.status === 422 ) {
        return {
          ...state,
          malformedStoryError: true
        };
      }
      return state;
    case SET_BROWSER_WARNING:
      return {
        ...state,
        browserWarning: payload
      };
    default:
      return state;
  }
};

const requestFail = ( state ) => state.fails.requestFail;
const lastLockFail = ( state ) => state.fails.lastLockFail;
const needsReload = ( state ) => state.fails.needsReload;
const connectError = ( state ) => state.fails.connectError;
const lastError = ( state ) => state.fails.lastError;
const lastErrorTime = ( state ) => state.fails.lastErrorTime;
const malformedStoryError = ( state ) => state.fails.malformedStoryError;
const browserWarning = ( state ) => state.fails.browserWarning;

export default combineReducers( {
  fails,
} );

export const selector = createStructuredSelector( {
  requestFail,
  lastLockFail,
  needsReload,
  connectError,
  lastError,
  lastErrorTime,
  malformedStoryError,
  browserWarning,
} );

