/**
 * This module exports logic-related elements for the fonio global ui
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/GlobalUi
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';
import {v4 as uuid} from 'uuid';
import {persistentReducer} from 'redux-pouchdb';

/*
 * Action names
 */
import {IMPORT_SUCCESS, COPY_STORY} from '../StoriesManager/duck';

export const RESET_APP = 'RESET_APP';
/*
 * actions related to global stories management in ui
 */
export const START_STORY_CANDIDATE_CONFIGURATION = '$Fonio/StoryEditor/START_STORY_CANDIDATE_CONFIGURATION';
export const APPLY_STORY_CANDIDATE_CONFIGURATION = '$Fonio/StoryEditor/APPLY_STORY_CANDIDATE_CONFIGURATION';
export const SET_ACTIVE_STORY = '$Fonio/StoryEditor/SET_ACTIVE_STORY';
export const UNSET_ACTIVE_STORY = '$Fonio/StoryEditor/UNSET_ACTIVE_STORY';
/*
 * actions related to global ui
 */
export const OPEN_STORY_CANDIDATE_MODAL = '$Fonio/StoryEditor/OPEN_STORY_CANDIDATE_MODAL';
export const CLOSE_STORY_CANDIDATE_MODAL = '$Fonio/StoryEditor/CLOSE_STORY_CANDIDATE_MODAL';
export const OPEN_TAKE_AWAY_MODAL = '$Fonio/StoryEditor/OPEN_TAKE_AWAY_MODAL';
export const CLOSE_TAKE_AWAY_MODAL = '$Fonio/StoryEditor/CLOSE_TAKE_AWAY_MODAL';
export const SET_UI_MODE = '$Fonio/StoryEditor/SET_UI_MODE';
export const SET_ASIDE_UI_MODE = '$Fonio/StoryEditor/SET_ASIDE_UI_MODE';
export const OPEN_PASSWORD_MODAL = '$Fonio/StoryEditor/OPEN_PASSWORD_MODAL';

/**
 * Starts a story configuration
 * @param {object} story - the data to use for bootstrapping story configuration
 */
export const startStoryCandidateConfiguration = (story) => ({
  type: START_STORY_CANDIDATE_CONFIGURATION,
  story,
  id: story !== undefined && story.id ? story.id : uuid()
});

/**
 * Applies the settings set in configuration modal to actual stories data
 * @param {object} story - the data to use for merging back story data from story configuration state
 * @return {object} action - the redux action to dispatch
 */
export const applyStoryCandidateConfiguration = (story) => ({
  type: APPLY_STORY_CANDIDATE_CONFIGURATION,
  story
});

/**
 * Sets an active story to edit
 * @param {object} story - the story to set as editor's edited story
 * @return {object} action - the redux action to dispatch
 */
export const setActiveStory = (story) => ({
  type: SET_ACTIVE_STORY,
  story
});

/**
 * Unsets the active story being edited if any
 * @param {object} story - the story to unset as editor's edited story
 * @return {object} action - the redux action to dispatch
 */
export const unsetActiveStory = () => ({
  type: UNSET_ACTIVE_STORY
});

/**
 * Opens the story candidate view
 * @return {object} action - the redux action to dispatch
 */
export const openStoryCandidateModal = () => ({
  type: OPEN_STORY_CANDIDATE_MODAL
});

/**
 * Closes the story candidate view
 * @return {object} action - the redux action to dispatch
 */
export const closeStoryCandidateModal = () => ({
  type: CLOSE_STORY_CANDIDATE_MODAL
});

/**
 * Opens the take away view
 * @return {object} action - the redux action to dispatch
 */
export const openTakeAwayModal = () => ({
  type: OPEN_TAKE_AWAY_MODAL
});

/**
 * Closes the take away view
 * @return {object} action - the redux action to dispatch
 */
export const closeTakeAwayModal = () => ({
  type: CLOSE_TAKE_AWAY_MODAL
});

/**
 * Sets the state of main view ('edition' or 'preview')
 * @param {string} mode - the mode to switch to
 * @return {object} action - the redux action to dispatch
 */
export const setUiMode = (mode = 'edition') => ({
  type: SET_UI_MODE,
  mode
});

/**
 * Sets the state of the aside view ('sections' or 'resources')
 * @param {string} mode - the mode to switch to
 * @return {object} action - the redux action to dispatch
 */
export const setAsideUiMode = (mode = 'sections') => ({
  type: SET_ASIDE_UI_MODE,
  mode
});

/**
 * Opens the set password view
 * @return {object} action - the redux action to dispatch
 */
export const openPasswordModal = () => ({
  type: OPEN_PASSWORD_MODAL
});


/**
 * Default/fallback state of the global ui state
 */
const GLOBAL_UI_DEFAULT_STATE = {

    /**
     * Represents whether configuration/new story modal is open
     * @type {boolean}
     */
    storyCandidateModalOpen: false,

    /**
     * Represents whether hide cancel setting modal
     * @type {boolean}
     */
    hideCancelSettingButton: false,

    /**
     * Represents whether take away / export modal is open
     * @type {boolean}
     */
    takeAwayModalOpen: false,


    /**
     * Represents whether settings are visible for selected slide
     * @type {boolean}
     */
    slideSettingsPannelOpen: false,

    /**
     * Represents a state machine for the ui screens
     * @type {string}
     */
    uiMode: 'edition', // in ['edition', 'preview'],

    /**
     * Represents the state of the aside column
     * @type {string}
     */
    asideUiMode: 'resources', // in ['sections', 'resources'],
};

/**
 * This redux reducer handles the global ui state management (screen & modals opening)
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function globalUi(state = GLOBAL_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    // cases ui is reset
    case RESET_APP:
      return GLOBAL_UI_DEFAULT_STATE;
    // case configuration is closed and new story is set
    case APPLY_STORY_CANDIDATE_CONFIGURATION:
      return {
        ...state,
        storyCandidateModalOpen: false,
        uiMode: 'edition'
      };
    // case story configuration is opened
    case START_STORY_CANDIDATE_CONFIGURATION:
    case OPEN_STORY_CANDIDATE_MODAL:
      return {
        ...state,
        storyCandidateModalOpen: true,
        hideCancelSettingButton: false
      };
    case IMPORT_SUCCESS:
    case COPY_STORY:
      return {
        ...state,
        storyCandidateModalOpen: true,
        hideCancelSettingButton: true
      };
    // case story configuration is closed
    case CLOSE_STORY_CANDIDATE_MODAL:
      return {
        ...state,
        storyCandidateModalOpen: false
      };
    // case take away view is opened
    case OPEN_TAKE_AWAY_MODAL:
      return {
        ...state,
        takeAwayModalOpen: true
      };
    // case take away view is closed
    case CLOSE_TAKE_AWAY_MODAL:
      return {
        ...state,
        takeAwayModalOpen: false
      };
    // case main view ui is set (to 'edition' or 'preview')
    case SET_UI_MODE:
      return {
        ...state,
        uiMode: action.mode
      };
    // case aside view is set (to 'sections' or 'resources')
    case SET_ASIDE_UI_MODE:
      return {
        ...state,
        asideUiMode: action.mode
      };
    // case take away view is opened
    case OPEN_PASSWORD_MODAL:
      return {
        ...state,
        passwordModalOpen: true
      };
    default:
      return state;
  }
}


/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers({
  globalUi: persistentReducer(globalUi, 'fonio-globalUi')
});


/**
 * Selectors related to global ui
 */
const isStoryCandidateModalOpen = state => state.globalUi.storyCandidateModalOpen;
const isTakeAwayModalOpen = state => state.globalUi.takeAwayModalOpen;
const isPasswordModalOpen = state => state.globalUi.passwordModalOpen;
const hideCancelSettingButton = state => state.globalUi.hideCancelSettingButton;
const slideSettingsPannelState = state => state.globalUi.slideSettingsPannelState;
const globalUiMode = state => state.globalUi.uiMode;
const asideUiMode = state => state.globalUi.asideUiMode;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  globalUiMode,
  asideUiMode,
  isStoryCandidateModalOpen,
  isTakeAwayModalOpen,
  isPasswordModalOpen,
  hideCancelSettingButton,
  slideSettingsPannelState,
});
