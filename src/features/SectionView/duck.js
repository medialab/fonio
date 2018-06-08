/**
 * This module exports logic-related elements for the fonio section view feature
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/SectionView
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';


/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
import {ENTER_BLOCK} from '../ConnectionsManager/duck';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */


/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */

/**
 * @todo refactor as helper
 */

const UI_DEFAULT_STATE = {
};

/**
 * This redux reducer handles the state of the ui
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function ui(state = UI_DEFAULT_STATE, action) {
  // const {payload} = action;
  switch (action.type) {
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
const viewLockState = state => state.lockManagement.viewLockState;
/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  viewLockState,
});
