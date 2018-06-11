/**
 * This module exports logic-related elements for the fonio section view feature
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/SectionView
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';

import {getStatePropFromActionSet} from '../../helpers/reduxUtils';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
import {ENTER_BLOCK} from '../ConnectionsManager/duck';

const SET_ASIDE_TAB_MODE = 'SET_ASIDE_TAB_MODE';
const SET_ASIDE_TAB_COLLAPSED = 'SET_ASIDE_TAB_COLLAPSED';
const SET_MAIN_COLUMN_MODE = 'SET_MAIN_COLUMN_MODE';
const SET_RESOURCE_SORT_VISIBLE = 'SET_RESOURCE_SORT_VISIBLE';
const SET_RESOURCE_FILTER_VISIBLE = 'SET_RESOURCE_FILTER_VISIBLE';
const SET_VIEW_LOCK_STATE = 'SET_VIEW_LOCK_STATE';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setAsideTabMode = payload => ({
  type: SET_ASIDE_TAB_MODE,
  payload,
});

export const setAsideTabCollapsed = payload => ({
  type: SET_ASIDE_TAB_COLLAPSED,
  payload,
});

export const setMainColumnMode = payload => ({
  type: SET_MAIN_COLUMN_MODE,
  payload,
});

export const setResourceFilterVisible = payload => ({
  type: SET_RESOURCE_FILTER_VISIBLE,
  payload
});

export const setResourceSortVisible = payload => ({
  type: SET_RESOURCE_SORT_VISIBLE,
  payload
});

export const setViewLockState = payload => ({
  type: SET_VIEW_LOCK_STATE,
  payload,
});

/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */


const UI_DEFAULT_STATE = {
  asideTabMode: 'library',
  asideTabCollapsed: false,
  mainColumnMode: 'edition',
  resourceSortVisible: false,
  resourceFilterVisible: false,
};

/**
 * This redux reducer handles the state of the ui
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function ui(state = UI_DEFAULT_STATE, action) {
  const {payload} = action;
  switch (action.type) {
    case SET_ASIDE_TAB_MODE:
    case SET_ASIDE_TAB_COLLAPSED:
    case SET_MAIN_COLUMN_MODE:
    case SET_RESOURCE_SORT_VISIBLE:
    case SET_RESOURCE_FILTER_VISIBLE:
      const propName = getStatePropFromActionSet(action.type);
      return {
        ...state,
        [propName]: payload
      };
    default:
      return state;
  }
}

const LOCK_MANAGEMENT_DEFAULT_STATE = {
  /**
   * Status of the global view lock ([undefined, 'pending', 'success', 'fail', 'idle'])
   */
  viewLockState: undefined,
};

/**
 * This redux reducer handles the state of the ui
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function lockManagement(state = LOCK_MANAGEMENT_DEFAULT_STATE, action) {
  const {payload} = action;
  switch (action.type) {
    case `${ENTER_BLOCK}`:
      if (payload.location === 'sections') {
        return {
          ...state,
          viewLockState: 'pending'
        };
      }
      return state;

    case `${ENTER_BLOCK}_SUCCESS`:
      if (payload.location === 'sections') {
        return {
          ...state,
          viewLockState: 'success'
        };
      }
      return state;
    case `${ENTER_BLOCK}_FAIL`:
      if (payload.location === 'sections') {
        return {
          ...state,
          viewLockState: 'fail'
        };
      }
      return state;
    case SET_VIEW_LOCK_STATE:
      return {
        ...state,
        viewLockState: payload
      };
    default:
      return state;
  }
}


/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers({
  ui,
  lockManagement,
});

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */

const asideTabMode = state => state.ui.asideTabMode;
const asideTabCollapsed = state => state.ui.asideTabCollapsed;
const mainColumnMode = state => state.ui.mainColumnMode;
const resourceSortVisible = state => state.ui.resourceSortVisible;
const resourceFilterVisible = state => state.ui.resourceFilterVisible;

const viewLockState = state => state.lockManagement.viewLockState;
/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  asideTabMode,
  asideTabCollapsed,
  mainColumnMode,

  resourceSortVisible,
  resourceFilterVisible,

  viewLockState,
});
