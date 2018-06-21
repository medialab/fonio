/**
 * This module exports logic-related elements for the fonio design view feature
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/DesignView
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';

import {getStatePropFromActionSet} from '../../helpers/reduxUtils';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
/**
 * UI
 */
const SET_ASIDE_TAB_MODE = 'SET_ASIDE_TAB_MODE';
const SET_ASIDE_TAB_COLLAPSED = 'SET_ASIDE_TAB_COLLAPSED';

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

/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */


const UI_DEFAULT_STATE = {
  asideTabMode: 'settings',
  asideTabCollapsed: false,
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
      const propName = getStatePropFromActionSet(action.type);
      return {
        ...state,
        [propName]: payload
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
});

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */

const asideTabMode = state => state.ui.asideTabMode;
const asideTabCollapsed = state => state.ui.asideTabCollapsed;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  asideTabMode,
  asideTabCollapsed,
});
