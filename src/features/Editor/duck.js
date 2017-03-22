/**
 * This module exports logic-related elements for the fonio editor feature
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/Editor
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';
import {v4 as uuid} from 'uuid';
import {persistentReducer} from 'redux-pouchdb';

/*
 * Action names
 */
export const RESET_APP = 'RESET_APP';
/*
 * actions related to global storys management in ui
 */
export const START_STORY_CANDIDATE_CONFIGURATION = '$Fonio/Editor/START_STORY_CANDIDATE_CONFIGURATION';
export const APPLY_STORY_CANDIDATE_CONFIGURATION = '$Fonio/Editor/APPLY_STORY_CANDIDATE_CONFIGURATION';
export const SET_ACTIVE_STORY = '$Fonio/Editor/SET_ACTIVE_STORY';
export const UNSET_ACTIVE_STORY = '$Fonio/Editor/UNSET_ACTIVE_STORY';
/*
 * actions related to global ui
 */
const OPEN_STORY_CANDIDATE_MODAL = '$Fonio/Editor/OPEN_STORY_CANDIDATE_MODAL';
const CLOSE_STORY_CANDIDATE_MODAL = '$Fonio/Editor/CLOSE_STORY_CANDIDATE_MODAL';
const OPEN_TAKE_AWAY_MODAL = '$Fonio/Editor/OPEN_TAKE_AWAY_MODAL';
const CLOSE_TAKE_AWAY_MODAL = '$Fonio/Editor/CLOSE_TAKE_AWAY_MODAL';
const SET_UI_MODE = '$Fonio/Editor/SET_UI_MODE';

/*
 * Action creators
 */

/**
 * @param {object} story - the data to use for bootstrapping story configuration
 */
export const startStoryCandidateConfiguration = (story) => ({
  type: START_STORY_CANDIDATE_CONFIGURATION,
  story,
  id: story !== undefined && story.id ? story.id : uuid()
});
/**
 * @param {object} story - the data to use for merging back story data from story configuration state
 */
export const applyStoryCandidateConfiguration = (story) => ({
  type: APPLY_STORY_CANDIDATE_CONFIGURATION,
  story
});
/**
 * @param {object} story - the story to set as editor's edited story
 */
export const setActiveStory = (story) => ({
  type: SET_ACTIVE_STORY,
  story
});
/**
 * @param {object} story - the story to unset as editor's edited story
 */
export const unsetActiveStory = () => ({
  type: UNSET_ACTIVE_STORY
});
/**
 *
 */
export const openStoryCandidateModal = () => ({
  type: OPEN_STORY_CANDIDATE_MODAL
});
/**
 *
 */
export const closeStoryCandidateModal = () => ({
  type: CLOSE_STORY_CANDIDATE_MODAL
});
/**
 *
 */
export const openTakeAwayModal = () => ({
  type: OPEN_TAKE_AWAY_MODAL
});
/**
 *
 */
export const closeTakeAwayModal = () => ({
  type: CLOSE_TAKE_AWAY_MODAL
});
/**
 *
 */
export const setUiMode = (mode = 'edition') => ({
  type: SET_UI_MODE,
  mode
});
/**
 *
 */
export const resetApp = () => ({
  type: RESET_APP
});

/*
 * Reducers
 */

const EDITOR_DEFAULT_STATE = {
};
/**
 * This redux reducer handles the modification of the active story edited by user and related ui states
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 */
function editor(state = EDITOR_DEFAULT_STATE, action) {
  switch (action.type) {
    default:
      return state;
  }
}

const GLOBAL_UI_DEFAULT_STATE = {
    /**
     * Represents whether configuration/new story modal is open
     * @type {boolean}
     */
    storyCandidateModalOpen: false,
    /**
     * Represents whether take away / export modal is open
     * @type {boolean}
     */
    takeAwayModalOpen: false,
    /**
     * Represents  the uuid of the story being edited
     * @type {string}
     */
    activeStoryId: undefined,
    /**
     * Represents whether settings are visible for selected slide
     * @type {boolean}
     */
    slideSettingsPannelOpen: false,
    /**
     * Represent a state machine for the ui screens
     * @type {string}
     */
    uiMode: 'edition' // in ['edition', 'preview']
};
/**
 * This redux reducer handles the global ui state management (screen & modals opening)
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 */
function globalUi(state = GLOBAL_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    case RESET_APP:
      return GLOBAL_UI_DEFAULT_STATE;
    case APPLY_STORY_CANDIDATE_CONFIGURATION:
      return {
        ...state,
        storyCandidateModalOpen: false,
        activeStoryId: action.story.id
      };
    case SET_ACTIVE_STORY:
      return {
        ...state,
        activeStoryId: action.story.id
      };
    case UNSET_ACTIVE_STORY:
      return {
        ...state,
        activeStoryId: undefined
      };
    case START_STORY_CANDIDATE_CONFIGURATION:
    case OPEN_STORY_CANDIDATE_MODAL:
      return {
        ...state,
        storyCandidateModalOpen: true
      };
    case CLOSE_STORY_CANDIDATE_MODAL:
      return {
        ...state,
        storyCandidateModalOpen: false
      };
    case OPEN_TAKE_AWAY_MODAL:
      return {
        ...state,
        takeAwayModalOpen: true
      };
    case CLOSE_TAKE_AWAY_MODAL:
      return {
        ...state,
        takeAwayModalOpen: false
      };
    case SET_UI_MODE:
      return {
        ...state,
        uiMode: action.mode
      };
    default:
      return state;
  }
}
/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default persistentReducer(combineReducers({
  globalUi,
  editor
}), 'fonio-editor');

/*
 * Selectors
 */
/*
 * Selectors related to global ui
 */
const activeStoryId = state => state.globalUi.activeStoryId;
const isStoryCandidateModalOpen = state => state.globalUi.storyCandidateModalOpen;
const isTakeAwayModalOpen = state => state.globalUi.takeAwayModalOpen;
const slideSettingsPannelState = state => state.globalUi.slideSettingsPannelState;
const globalUiMode = state => state.globalUi.uiMode;
/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  activeStoryId,
  globalUiMode,
  isStoryCandidateModalOpen,
  isTakeAwayModalOpen,
  slideSettingsPannelState,
});
