/**
 * This module exports logic-related elements for the fonio global ui
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/SummaryView
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';

import {getStatePropFromActionSet} from '../../helpers/reduxUtils';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
 import {ENTER_BLOCK, LEAVE_BLOCK, LEAVE_STORY} from '../ConnectionsManager/duck';
/**
 * ui
 */
const SET_METADATA_OPEN = 'SET_METADATA_OPEN';
const SET_NEW_SECTION_OPEN = 'SET_NEW_SECTION_OPEN';

/**
 * lock system
 */
/**
 * data
 */
const SET_STORY_METADATA = 'SET_STORY_METADATA';
/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setMetadataOpen = payload => ({
  type: SET_METADATA_OPEN,
  payload
});


export const setStoryMetadata = payload => ({
  type: SET_STORY_METADATA,
  payload
});

export const setNewSectionOpen = payload => ({
  type: SET_NEW_SECTION_OPEN,
  payload
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
  metadataOpen: false,
  /**
   * Whether new section dialog is open
   */
  newSectionOpen: false,
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
    case LEAVE_STORY:
      return UI_DEFAULT_STATE;
    case SET_METADATA_OPEN:
    case SET_NEW_SECTION_OPEN:
      const propName = getStatePropFromActionSet(action.type);
      return {
        ...state,
        [propName]: payload
      };
    case `${ENTER_BLOCK}_SUCCESS`:
      if (payload.location === 'storyMetadata') {
        return {
          ...state,
          metadataOpen: true
        };
      }
      return state;
    case `${ENTER_BLOCK}_FAIL`:
    case `${LEAVE_BLOCK}`:
      if (payload.location === 'storyMetadata') {
        return {
          ...state,
          metadataOpen: false
        };
      }
      return state;
    default:
      return state;
  }
}


export default combineReducers({
  ui,
});

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */

const metadataOpen = state => state.ui.metadataOpen;
const newSectionOpen = state => state.ui.newSectionOpen;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  metadataOpen,
  newSectionOpen,
});
