/**
 * This module exports logic-related elements for the home view
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/HomeView
 */

import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';

import { get, post, put, delete as del } from 'axios';

import config from '../../config';

import { createDefaultStory, validateStory } from '../../helpers/schemaUtils';

import { getFileAsText } from '../../helpers/fileLoader';
import { getStatePropFromActionSet } from '../../helpers/reduxUtils';
import { loadUserInfo } from '../../helpers/localStorageUtils';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
/**
 * ui
 */
import { RESET_VIEWS_UI } from '../EditionUiWrapper/duck';

const SET_TAB_MODE = 'SET_TAB_MODE';
const SET_NEW_STORY_OPEN = 'SET_NEW_STORY_OPEN';
const SET_NEW_STORY_TAB_MODE = 'SET_NEW_STORY_TAB_MODE';
const SET_SEARCH_STRING = 'SET_SEARCH_STRING';
const SET_SORTING_MODE = 'SET_SORTING_MODE';
const SET_IDENTIFICATION_MODAL_SWITCH = 'SET_IDENTIFICATION_MODAL_SWITCH';
const SET_PREVIEWED_STORY_ID = 'SET_PREVIEWED_STORY_ID';
const SET_USER_INFO_TEMP = 'SET_USER_INFO_TEMP';
const SET_EDITION_HISTORY = 'SET_EDITION_HISTORY';
const SET_STORY_DELETE_ID = 'SET_STORY_DELETE_ID';
const SET_CHANGE_PASSWORD_ID = 'SET_CHANGE_PASSWORD_ID';
const SET_PASSWORD_MODAL_OPEN = 'SET_PASSWORD_MODAL_OPEN';
const SET_OVERRIDE_IMPORT = 'SET_OVERRIDE_IMPORT';
const SET_OVERRIDE_STORY_MODE = 'SET_OVERRIDE_STORY_MODE';

export const FETCH_STORIES = 'FETCH_STORIES';
export const CREATE_STORY = 'CREATE_STORY';
export const OVERRIDE_STORY = 'OVERRIDE_STORY';
export const DUPLICATE_STORY = 'DUPLICATE_STORY';
export const DELETE_STORY = 'DELETE_STORY';
export const IMPORT_STORY = 'IMPORT_STORY';

export const CHANGE_PASSWORD = 'CHANGE_PASSWORD';

import { SET_USER_INFO } from '../UserInfoManager/duck';

/**
 * data
 */
const SET_NEW_STORY_METADATA = 'NEW_STORY_METADATA';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setTabMode = ( payload ) => ( {
  type: SET_TAB_MODE,
  payload
} );
export const setNewStoryOpen = ( payload ) => ( {
  type: SET_NEW_STORY_OPEN,
  payload
} );
export const setNewStoryTabMode = ( payload ) => ( {
  type: SET_NEW_STORY_TAB_MODE,
  payload
} );
export const setSearchString = ( payload ) => ( {
  type: SET_SEARCH_STRING,
  payload
} );
export const setSortingMode = ( payload ) => ( {
  type: SET_SORTING_MODE,
  payload
} );
export const setIdentificationModalSwitch = ( payload ) => ( {
  type: SET_IDENTIFICATION_MODAL_SWITCH,
  payload
} );
export const setPreviewedStoryId = ( payload ) => ( {
  type: SET_PREVIEWED_STORY_ID,
  payload
} );

export const setNewStoryMetadata = ( payload ) => ( {
  type: SET_NEW_STORY_METADATA,
  payload
} );
export const setUserInfoTemp = ( payload ) => ( {
  type: SET_USER_INFO_TEMP,
  payload
} );
export const setEditionHistory = ( payload ) => ( {
  type: SET_EDITION_HISTORY,
  payload
} );
export const setStoryDeleteId = ( payload ) => ( {
  type: SET_STORY_DELETE_ID,
  payload
} );
export const setChangePasswordId = ( payload ) => ( {
  type: SET_CHANGE_PASSWORD_ID,
  payload
} );
export const setPasswordModalOpen = ( payload ) => ( {
  type: SET_PASSWORD_MODAL_OPEN,
  payload
} );

export const setOverrideStoryMode = ( payload ) => ( {
  type: SET_OVERRIDE_STORY_MODE,
  payload,
} );

export const fetchStories = () => ( {
  type: FETCH_STORIES,
  promise: () => {
    const serverRequestUrl = `${config.restUrl}/stories/`;/* eslint no-undef: 0 */
    return get( serverRequestUrl );
  },
} );

export const createStory = ( { payload, password } ) => ( {
  type: CREATE_STORY,
  payload,
  promise: () => {
    const serverRequestUrl = `${config.restUrl}/stories/`;/* eslint no-undef: 0 */
    return post( serverRequestUrl, { payload, password } );
  },
} );

export const overrideStory = ( { payload, token } ) => ( {
  type: OVERRIDE_STORY,
  payload,
  promise: () => {
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    const serverRequestUrl = `${config.restUrl}/stories/${payload.id}`;/* eslint no-undef: 0 */
    return put( serverRequestUrl, payload, options );
  },
} );

export const importStory = ( file ) => ( {
  type: IMPORT_STORY,
  promise: () =>
    new Promise( ( resolve, reject ) => {
      return getFileAsText( file )
             .then( ( text ) => {
                let story;
                try {
                  story = JSON.parse( text );
                }
                catch ( jsonError ) {
                  return reject( 'malformed json' );
                }
                const validation = validateStory( story );
                if ( validation.valid ) {
                  resolve( story );
                }
                else reject( validation.errors );
             } )
             .catch( ( e ) => reject( e ) );
    } ),
} );

/**
 * Displays an override warning when user tries to import
 * a story that has the same id as an existing one
 * @param {object} candidate - the data of the story waiting to be imported or not instead of existing one
 * @return {object} action - the redux action to dispatch
 */
export const setOverrideImport = ( payload ) => ( {
  type: SET_OVERRIDE_IMPORT,
  payload
} );

export const duplicateStory = ( payload ) => ( {
  type: DUPLICATE_STORY,
  payload,
  promise: () => {
    const { storyId } = payload;
    const serverRequestUrl = `${config.restUrl}/stories/${storyId}?edit=false&&format=json`;
    return get( serverRequestUrl );
  },
} );

export const deleteStory = ( payload ) => ( {
  type: DELETE_STORY,
  payload,
  promise: () => {
    const { storyId, token } = payload;
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    const serverRequestUrl = `${config.restUrl}/stories/${storyId}`;
    return del( serverRequestUrl, options );
  },
} );

export const changePassword = ( payload ) => ( {
  type: CHANGE_PASSWORD,
  payload,
  promise: () => {
    const serverRequestUrl = `${config.restUrl}` + '/auth/resetPassword/';
    return post( serverRequestUrl, payload );
  }
} );

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

  /**
   * id of a story to delete
   */
  storyDeleteId: undefined,

  /**
   * id of a story to change password
   */
  changePasswordId: undefined,

  /**
   * Whether story password modal pop up
   */
  passwordModalOpen: false,

  /**
   * status of the import story process (['processing', 'fail', 'success'])
   */
  importStoryStatus: undefined,

  /**
   * status of the create story process (['processing', 'fail', 'success'])
   */
  createStoryStatus: undefined,

  /**
   * status of the override story process (['processing', 'fail', 'success'])
   */
  overrideStoryStatus: undefined,

  /**
   * status of the delete story process (['processing', 'fail', 'success'])
   */
  deleteStoryStatus: undefined,

  /**
   * message to show if imported story is exist
   */
  overrideImport: false,

  /**
   * mode of override story ['create', 'override']
   */
  overrideStoryMode: undefined,
};

/**
 * This redux reducer handles the global ui state management (screen & modals opening)
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function ui( state = UI_DEFAULT_STATE, action ) {
  const { payload } = action;
  let propName;
  switch ( action.type ) {

    case RESET_VIEWS_UI:
      return UI_DEFAULT_STATE;
    case SET_TAB_MODE:
    case SET_SEARCH_STRING:
    case SET_SORTING_MODE:
    case SET_IDENTIFICATION_MODAL_SWITCH:
    case SET_PREVIEWED_STORY_ID:
    case SET_STORY_DELETE_ID:
    case SET_CHANGE_PASSWORD_ID:
    case SET_OVERRIDE_IMPORT:
    case SET_OVERRIDE_STORY_MODE:
      propName = getStatePropFromActionSet( action.type );
      return {
        ...state,
        [propName]: payload
      };
    case SET_NEW_STORY_OPEN:
    case SET_NEW_STORY_TAB_MODE:
    case SET_PASSWORD_MODAL_OPEN:
      propName = getStatePropFromActionSet( action.type );
      return {
        ...state,
        [propName]: payload,
        importStoryStatus: undefined,
        createStoryStatus: undefined,
        overrideStoryStatus: undefined,
        overrideImport: false,
      };
    case `${CREATE_STORY}_SUCCESS`:
      return {
        ...state,
        createStoryStatus: 'success'
      };
    case `${CREATE_STORY}_FAIL`:
      return {
        ...state,
        createStoryStatus: 'fail'
      };
    case `${OVERRIDE_STORY}_FAIL`:
      return {
        ...state,
        overrideStoryStatus: 'fail'
      };
    case `${DELETE_STORY}_SUCCESS`:
      return {
        ...state,
        deleteStoryStatus: 'success',
        storyDeleteId: undefined
      };
    case `${DELETE_STORY}_FAIL`:
      return {
        ...state,
        deleteStoryStatus: 'fail'
      };
    case `${CHANGE_PASSWORD}_SUCCESS`:
      return {
        ...state,
        changePasswordId: undefined
      };
    case `${IMPORT_STORY}_FAIL`:
      return {
        ...state,
        importStoryStatus: 'fail'
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
function data( state = DATA_DEFAULT_STATE, action ) {
  const { payload } = action;
  let story;
  let newStory;
  switch ( action.type ) {
     case SET_EDITION_HISTORY:
      const propName = getStatePropFromActionSet( action.type );
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
      if ( payload === 'form' ) {
        newStory = createDefaultStory();
        return {
          ...state,
          newStory
        };
      }
      else return state;
    case SET_OVERRIDE_STORY_MODE:
      if ( payload === 'create' ) {
        return {
          ...state,
          newStory: {
            ...state.newStory,
            metadata: {
              ...state.newStory.metadata,
              title: `${state.newStory.metadata.title} - copy`
            }
          }
        };
      }
      else return state;
    case `${DUPLICATE_STORY}_SUCCESS`:
      const { data: newData } = action.result;
      return {
        ...state,
        newStory: newData
      };
    case `${IMPORT_STORY}_SUCCESS`:
      return {
        ...state,
        newStory: action.result
      };
    case `${FETCH_STORIES}_SUCCESS`:
      const { data: thatData } = action.result;
      return {
        ...state,
        stories: thatData
      };
    case `${CREATE_STORY}_SUCCESS`:
      story = action.result.data && action.result.data.story;
      return {
        ...state,
        stories: {
          ...state.stories,
          [story.id]: story
        }
      };
    case `${OVERRIDE_STORY}_SUCCESS`:
      story = action.result.data;
      return {
        ...state,
        stories: {
          ...state.stories,
          [story.id]: story
        }
      };
    case `${CREATE_STORY}_BROADCAST`:
    case `${OVERRIDE_STORY}_BROADCAST`:
      return {
        ...state,
        stories: {
          ...state.stories,
          [payload.id]: payload,
        }
      };
    case `${DELETE_STORY}_SUCCESS`:
    case `${DELETE_STORY}_BROADCAST`:
      const newStories = { ...state.stories };
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
      if ( payload === false ) {
        return {
          ...state,
          userInfoTemp: loadUserInfo()
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
export default combineReducers( {
  ui,
  data
} );

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */

const tabMode = ( state ) => state.ui.tabMode;
const newStoryOpen = ( state ) => state.ui.newStoryOpen;
const newStoryTabMode = ( state ) => state.ui.newStoryTabMode;
const searchString = ( state ) => state.ui.searchString;
const sortingMode = ( state ) => state.ui.sortingMode;
const identificationModalSwitch = ( state ) => state.ui.identificationModalSwitch;
const storyDeleteId = ( state ) => state.ui.storyDeleteId;
const changePasswordId = ( state ) => state.ui.changePasswordId;
const passwordModalOpen = ( state ) => state.ui.passwordModalOpen;
const importStoryStatus = ( state ) => state.ui.importStoryStatus;
const createStoryStatus = ( state ) => state.ui.createStoryStatus;
const overrideStoryStatus = ( state ) => state.ui.overrideStoryStatus;
const deleteStoryStatus = ( state ) => state.ui.deleteStoryStatus;
const overrideImport = ( state ) => state.ui.overrideImport;
const overrideStoryMode = ( state ) => state.ui.overrideStoryMode;

const newStory = ( state ) => state.data.newStory;
const stories = ( state ) => state.data.stories;
const userInfoTemp = ( state ) => state.data.userInfoTemp;
const editionHistory = ( state ) => state.data.editionHistory;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector( {
  tabMode,
  newStoryOpen,
  newStoryTabMode,
  searchString,
  sortingMode,
  newStory,
  identificationModalSwitch,
  storyDeleteId,
  changePasswordId,
  passwordModalOpen,
  createStoryStatus,
  overrideStoryStatus,
  deleteStoryStatus,
  importStoryStatus,
  overrideImport,
  overrideStoryMode,
  userInfoTemp,
  editionHistory,
  stories
} );
