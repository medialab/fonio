/**
 * This module exports logic-related elements for handling the export of stories
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/TakeAwayDialog
 */
import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';
import publishToGist from '../../helpers/gistExporter';
import {publishStoryBundleServer, getStoryBundleServer} from '../../helpers/serverExporter';
import {persistentReducer} from 'redux-pouchdb';

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
const EXPORT_STORY_BUNDLE = '§Fonio/TakeAwayDialog/EXPORT_STORY_BUNDLE';
export const EXPORT_TO_GIST = '§Fonio/TakeAwayDialog/EXPORT_TO_GIST';
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
 * Handles and monitors the ui state of the "export to gist" operation
 * @param {object} htmlContent - the html content of the app to export to gist
 * @param {object} story - the story data to export to gist
 * @param {string} id - the id of the gist to which the story is stored (if it has already been exported once)
 * @return {object} action - the redux action to dispatch
 */
export const exportToGist = (htmlContent, story, gistId) => ({
  type: EXPORT_TO_GIST,
  promise: (dispatch) => {
    return new Promise((resolve, reject) => {
      return publishToGist(htmlContent, story, dispatch, TAKE_AWAY_STATUS, gistId)
              .then((d) => {
                resolve(d);
              })
              .catch((e) => {
                reject(e);
              });
    });
  }
});

/**
 * fetch story (with resource data) from server
 */
export const fetchStoryBundle = (id, format) => ({
  type: FETCH_STORY_BUNDLE,
  promise: () => {
  return new Promise((resolve, reject) => {
    return getStoryBundleServer(id, format)
      .then((response) => {
        resolve(response);
      })
      .catch((e) => {
        reject(e);
      });
   });
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
    return new Promise((resolve, reject) => {
      return publishStoryBundleServer(id)
              .then((d) => {
                resolve(d);
              })
              .catch((e) => {
                reject(e);
              });
    });
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
    // export to gist status is changed
    case EXPORT_TO_GIST + '_PENDING':
      return {
        ...state,
        takeAwayLog: 'connecting to github',
        takeAwayLogStatus: 'processing'
      };
    case EXPORT_TO_GIST + '_SUCCESS':
      return {
        ...state,
        takeAwayLog: 'your story is synchronized with gist',
        takeAwayLogStatus: 'success'
      };
    case EXPORT_TO_GIST + '_FAIL':
      return {
        ...state,
        takeAwayLog: 'your story could not be uploaded on gist',
        takeAwayLogStatus: 'failure'
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
export default persistentReducer(combineReducers({
  takeAwayUi
}), 'fonio-takeaway');
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

