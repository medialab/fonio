/**
 * This module exports logic-related elements for handling the export of stories
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/TakeAwayDialog
 */
import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';
import {publishStoryBundleServer, getStoryBundleServer} from '../../helpers/serverExporter';

import {
  RESET_APP,
  OPEN_TAKE_AWAY_MODAL,
  CLOSE_TAKE_AWAY_MODAL
} from '../GlobalUi/duck';

/*
 * Action names
 */
const SET_TAKE_AWAY_TYPE = '§Fonio/TakeAwayDialog/SET_TAKE_AWAY_TYPE';
const TAKE_AWAY_STATUS = '§Fonio/TakeAwayDialog/TAKE_AWAY_STATUS';
const FETCH_STORY_BUNDLE = '§Fonio/TakeAwayDialog/FETCH_STORY_BUNDLE';
export const EXPORT_STORY_BUNDLE = '§Fonio/TakeAwayDialog/EXPORT_STORY_BUNDLE';
/*
 * Action creators
 */

/**
 * Sets the active take away type in the ui
 * @param {string} takeAwayType - the type to set for the interface
 * @return {object} action - the redux action to dispatch
 */
export const setTakeAwayType = (takeAwayType) => ({
  type: SET_TAKE_AWAY_TYPE,
  takeAwayType
});

/**
 * Monitors the ui representation of the "take away" operation
 * @param {string} status - the status of the take away process to display
 * @param {string} log - the log message of the take away process to display
 * @return {object} action - the redux action to dispatch
 */
export const setTakeAwayStatus = (status, log) => dispatch => {
  dispatch({
    type: TAKE_AWAY_STATUS,
    status,
    log
  });
};

/**
 * fetch story (with resource data) from server
 */
export const fetchStoryBundle = (id, format) => ({
  type: FETCH_STORY_BUNDLE,
  promise: () => {
    return getStoryBundleServer(id, format);
  }
});
/**
 * Handles the "export story bundle on server" operation
 * @param {object} story - the story to export to the distant server
 * @return {object} action - the redux action to dispatch
 */
export const exportStoryBundle = (id) => ({
  type: EXPORT_STORY_BUNDLE,
  promise: () => {
    return publishStoryBundleServer(id);
  }
});

/*
 * Reducers
 */


/**
 * Default state of the "take away" ui
 */
const DEFAULT_TAKE_AWAY_UI_SETTINGS = {

    /**
     * The type of export being processed
     * @type {string}
     */
    takeAwayType: undefined,

    /**
     * The global status of take away (processing, success, error)
     * @type {string}
     */
    takeAwayLogStatus: undefined,

    /**
     * The precise status of takeaway
     * @type {string}
     */
    takeAwayLog: undefined,
};

/**
 * This redux reducer handles the modification of the ui state for take away choices
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the new state
 */
function takeAwayUi(state = DEFAULT_TAKE_AWAY_UI_SETTINGS, action) {
  switch (action.type) {
    // state is reset
    case OPEN_TAKE_AWAY_MODAL:
    case CLOSE_TAKE_AWAY_MODAL:
    case RESET_APP:
      return DEFAULT_TAKE_AWAY_UI_SETTINGS;

    // take away type is changed
    case SET_TAKE_AWAY_TYPE:
      return {
        ...state,
        takeAwayType: action.takeAwayType
      };

    case TAKE_AWAY_STATUS:
      return {
        ...state,
        takeAwayLog: action.log,
        takeAwayLogStatus: action.status
      };
    case FETCH_STORY_BUNDLE + '_PENDING':
    case EXPORT_STORY_BUNDLE + '_PENDING':
      return {
        ...state,
        takeAwayLog: 'bundling the story...',
        takeAwayLogStatus: 'processing'
      };
    case FETCH_STORY_BUNDLE + '_SUCCESS':
    case EXPORT_STORY_BUNDLE + '_SUCCESS':
      return {
        ...state,
        takeAwayLog: 'story is bundled',
        takeAwayLogStatus: 'success'
      };
    case FETCH_STORY_BUNDLE + '_FAIL':
    case EXPORT_STORY_BUNDLE + '_FAIL':
      return {
        ...state,
        takeAwayLog: 'story could not be bundled',
        takeAwayLogStatus: 'failure'
      };
    default:
      return state;
  }
}

/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers({
  takeAwayUi
});
/*
 * Selectors
 */
const takeAwayType = state => state.takeAwayUi &&
  state.takeAwayUi.takeAwayType;
const takeAwayLog = state => state.takeAwayUi &&
  state.takeAwayUi.takeAwayLog;
const takeAwayLogStatus = state => state.takeAwayUi &&
  state.takeAwayUi.takeAwayLogStatus;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  takeAwayLog,
  takeAwayLogStatus,
  takeAwayType
});

