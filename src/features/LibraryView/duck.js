/**
 * This module exports logic-related elements for the fonio global ui
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/LibraryView
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';

import {getStatePropFromActionSet} from '../../helpers/reduxUtils';

import resourceSchema from 'quinoa-schemas/resource';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
 import {LEAVE_STORY} from '../ConnectionsManager/duck';
/**
 * ui
 */
const SET_MAIN_COLUMN_MODE = 'SET_MAIN_COLUMN_MODE';
const SET_SORT_VISIBLE = 'SET_SORT_VISIBLE';
const SET_FILTER_VISIBLE = 'SET_FILTER_VISIBLE';
const SET_FILTER_VALUES = 'SET_FILTER_VALUES';
const SET_SORT_VALUE = 'SET_SORT_VALUE';
const SET_SEARCH_STRING = 'SET_SEARCH_STRING';
/**
 * lock system
 */
/**
 * data
 */
/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setMainColumnMode = payload => ({
  type: SET_MAIN_COLUMN_MODE,
  payload
});
export const setSortVisible = payload => ({
  type: SET_SORT_VISIBLE,
  payload
});
export const setFilterVisible = payload => ({
  type: SET_FILTER_VISIBLE,
  payload
});
export const setSearchString = payload => ({
  type: SET_SEARCH_STRING,
  payload,
});
export const setFilterValues = payload => ({
  type: SET_FILTER_VALUES,
  payload
});
export const setSortValue = payload => ({
  type: SET_SORT_VALUE,
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

const defaultFilterValues = Object.keys(resourceSchema.definitions)
  .reduce((result, type) => ({
    ...result,
    [type]: true
  }), {});

const UI_DEFAULT_STATE = {
  mainColumnMode: 'list',
  sortVisible: false,
  filterVisible: false,
  searchString: '',
  filterValues: defaultFilterValues,
  sortValue: 'title'
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
    case SET_MAIN_COLUMN_MODE:
    case SET_SORT_VISIBLE:
    case SET_FILTER_VISIBLE:
    case SET_SEARCH_STRING:
    case SET_FILTER_VALUES:
    case SET_SORT_VALUE:
      const propName = getStatePropFromActionSet(action.type);
      return {
        ...state,
        [propName]: payload
      };
    // case `${ENTER_BLOCK}_SUCCESS`:
    //   if (payload.location === 'storyMetadata') {
    //     return {
    //       ...state,
    //       metadataOpen: true
    //     };
    //   }
    //   return state;
    // case `${ENTER_BLOCK}_FAIL`:
    // case `${LEAVE_BLOCK}`:
    //   if (payload.location === 'storyMetadata') {
    //     return {
    //       ...state,
    //       metadataOpen: false
    //     };
    //   }
    //   return state;
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
const mainColumnMode = state => state.ui.mainColumnMode;
const sortVisible = state => state.ui.sortVisible;
const filterVisible = state => state.ui.filterVisible;
const searchString = state => state.ui.searchString;
const filterValues = state => state.ui.filterValues;
const sortValue = state => state.ui.sortValue;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  mainColumnMode,
  sortVisible,
  filterVisible,
  searchString,
  filterValues,
  sortValue,
});
