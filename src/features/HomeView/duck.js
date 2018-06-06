/**
 * This module exports logic-related elements for the fonio global ui
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/HomeView
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */


/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */
/**
 * Default/fallback state of the global ui state
 */
const UI_DEFAULT_STATE = {
};

/**
 * This redux reducer handles the global ui state management (screen & modals opening)
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function globalUi(state = UI_DEFAULT_STATE, action) {
  switch (action.type) {
    default:
      return state;
  }
}


/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers({
  globalUi
});

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */


/**
 * Selectors related to global ui
 */

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({

});
