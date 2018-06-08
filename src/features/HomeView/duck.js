/**
 * This module exports logic-related elements for the fonio global ui
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/HomeView
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';

import {get, post, delete as del} from 'axios';

import {createDefaultStory} from '../../helpers/schemaUtils';

import {getStatePropFromActionSet} from '../../helpers/reduxUtils';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
/**
 * ui
 */
const SET_TAB_MODE = 'SET_TAB_MODE';
const SET_NEW_STORY_OPEN = 'SET_NEW_STORY_OPEN';
const SET_NEW_STORY_TAB_MODE = 'SET_NEW_STORY_TAB_MODE';
const SET_SEARCH_STRING = 'SET_SEARCH_STRING';
const SET_SORTING_MODE = 'SET_SORTING_MODE';
const SET_IDENTIFICATION_MODAL_SWITCH = 'SET_IDENTIFICATION_MODAL_SWITCH';
const SET_PREVIEWED_STORY_ID = 'SET_PREVIEWED_STORY_ID';
const SET_USER_INFO_TEMP = 'SET_USER_INFO_TEMP';
const SET_EDITION_HISTORY = 'SET_EDITION_HISTORY';
const FETCH_STORIES = 'FETCH_STORIES';
const CREATE_STORY = 'CREATE_STORY';
const DELETE_STORY = 'DELETE_STORY';

import {SET_USER_INFO} from '../UserInfoManager/duck';
/**
 * data
 */
const SET_NEW_STORY_METADATA = 'NEW_STORY_METADATA';


/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setTabMode = payload => ({
  type: SET_TAB_MODE,
  payload
});
export const setNewStoryOpen = payload => ({
  type: SET_NEW_STORY_OPEN,
  payload
});
export const setNewStoryTabMode = payload => ({
  type: SET_NEW_STORY_TAB_MODE,
  payload
});
export const setSearchString = payload => ({
  type: SET_SEARCH_STRING,
  payload
});
export const setSortingMode = payload => ({
  type: SET_SORTING_MODE,
  payload
});
export const setIdentificationModalSwitch = payload => ({
  type: SET_IDENTIFICATION_MODAL_SWITCH,
  payload
});
export const setPreviewedStoryId = payload => ({
  type: SET_PREVIEWED_STORY_ID,
  payload
});

export const setNewStoryMetadata = payload => ({
  type: SET_NEW_STORY_METADATA,
  payload
});
export const setUserInfoTemp = payload => ({
  type: SET_USER_INFO_TEMP,
  payload
});
export const setEditionHistory = payload => ({
  type: SET_EDITION_HISTORY,
  payload
});

export const fetchStories = () => ({
  type: FETCH_STORIES,
  promise: () => {
    const serverRequestUrl = `${CONFIG.serverUrl}/stories/`;/* eslint no-undef: 0 */
    return get(serverRequestUrl);
  },
});


export const createStory = ({payload, password}) => ({
  type: CREATE_STORY,
  payload,
  promise: () => {
    const serverRequestUrl = `${CONFIG.serverUrl}/stories/`;/* eslint no-undef: 0 */
    return post(serverRequestUrl, {payload, password});
  },
});

export const deleteStory = payload => ({
  type: DELETE_STORY,
  payload,
  promise: () => {
    const {id, token} = payload;
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    const serverRequestUrl = `${CONFIG.serverUrl}/stories/${id}`;
    return del(serverRequestUrl, options);
  },
});

/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */
/**
 * Default/fallback state of the ui state
 */
const UI_DEFAULT_STATE = {
  /**
   * Tab of the main view
   */
  tabMode: 'stories',
  /**
   * Whether a new story is being edited
   */
  newStoryOpen: false,
  /**
   * Mode for the story creation interface (['form', 'file'])
   */
  newStoryTabMode: 'form',
  /**
   * string for searching the stories
   */
  searchString: '',
  /**
   * sorting mode of the stories (['last modification', 'creation date', 'title'])
   */
  sortingMode: 'title',
  /**
   * Whether identification modal is opened
   */
  identificationModalSwitch: false,
  /**
   * id of a story to display as a resume/readonly way
   */
  previewedStoryId: undefined,
};

/**
 * This redux reducer handles the global ui state management (screen & modals opening)
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function ui(state = UI_DEFAULT_STATE, action) {
  const {payload} = action;
  switch (action.type) {
    case SET_TAB_MODE:
    case SET_NEW_STORY_OPEN:
    case SET_NEW_STORY_TAB_MODE:
    case SET_SEARCH_STRING:
    case SET_SORTING_MODE:
    case SET_IDENTIFICATION_MODAL_SWITCH:
    case SET_PREVIEWED_STORY_ID:
      const propName = getStatePropFromActionSet(action.type);
      return {
        ...state,
        [propName]: payload
      };
    case `${CREATE_STORY}_SUCCESS`:
      return {
        ...state,
        newStoryOpen: false
      };
    default:
      return state;
  }
}

const DATA_DEFAULT_STATE = {
  /**
   * temp data of the new story form
   */
  newStory: {},
  /**
   * list of stories metadata
   */
  stories: {},
    /**
   * temp value of user info
   */
  userInfoTemp: {},
  /**
   * Map of the stories visited by the current client browser
   */
  editionHistory: {}
};

/**
 * This redux reducer handles the global ui state management (screen & modals opening)
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function data(state = DATA_DEFAULT_STATE, action) {
  const {payload} = action;
  let newStory;
  switch (action.type) {
     case SET_EDITION_HISTORY:
      const propName = getStatePropFromActionSet(action.type);
      return {
        ...state,
        [propName]: payload
      };

    case SET_NEW_STORY_OPEN:
      newStory = createDefaultStory();
      return {
        ...state,
        newStory
      };
    case SET_NEW_STORY_TAB_MODE:
      if (payload === 'form') {
        newStory = createDefaultStory();
        return {
          ...state,
          newStory
        };
      }
      else return state;
    case `${FETCH_STORIES}_SUCCESS`:
      const {data: thatData} = action.result;
      return {
        ...state,
        stories: thatData
      };
    case `${CREATE_STORY}_SUCCESS`:
      const {story, token} = action.result.data;
      localStorage.setItem(`fonio/storyToken/${story.id}`, token);
      return {
        ...state,
        stories: {
          ...state.stories,
          [story.id]: story
        }
      };
    case `${CREATE_STORY}_BROADCAST`:
      return {
        ...state,
        [payload.id]: payload,
      };
    case `${DELETE_STORY}_SUCCESS`:
    case `${DELETE_STORY}_BROADCAST`:
      localStorage.removeItem(`fonio/storyToken/${payload.id}`);
      const newStories = {...state.stories};
      delete newStories[payload.id];
      return {
        ...state,
        stories: newStories
      };
    case SET_USER_INFO:
    case SET_USER_INFO_TEMP:
      return {
        ...state,
        userInfoTemp: payload,
      };
    case SET_IDENTIFICATION_MODAL_SWITCH:
      if (payload === false) {
        return {
          ...state,
          userInfoTemp: JSON.parse(localStorage.getItem('fonio/user_info'))
        };
      }
      return state;
    default:
      return state;
  }
}

/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers({
  ui,
  data
});

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */

const tabMode = state => state.ui.tabMode;
const newStoryOpen = state => state.ui.newStoryOpen;
const newStoryTabMode = state => state.ui.newStoryTabMode;
const searchString = state => state.ui.searchString;
const sortingMode = state => state.ui.sortingMode;
const identificationModalSwitch = state => state.ui.identificationModalSwitch;

const newStory = state => state.data.newStory;
const stories = state => state.data.stories;
const userInfoTemp = state => state.data.userInfoTemp;
const editionHistory = state => state.data.editionHistory;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  tabMode,
  newStoryOpen,
  newStoryTabMode,
  searchString,
  sortingMode,
  newStory,
  identificationModalSwitch,
  userInfoTemp,
  editionHistory,
  stories
});
