/**
 * This module exports logic-related elements for the fonio story edition ui wrapper
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/EditionUiWrapper
 */

import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';

import { SET_USER_INFO } from '../UserInfoManager/duck';
import { loadUserInfo } from '../../helpers/localStorageUtils';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
const SET_USER_INFO_MODAL_OPEN = 'SET_USER_INFO_MODAL_OPEN';
const SET_EXPORT_MODAL_OPEN = 'SET_EXPORT_MODAL_OPEN';

const SET_USER_INFO_TEMP = 'SET_USER_INFO_TEMP';

const TOGGLE_NAVBAR_OPEN = 'TOGGLE_NAVBAR_OPEN';

export const RESET_VIEWS_UI = 'RESET_VIEWS_UI';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setUserInfoModalOpen = ( payload ) => ( {
  type: SET_USER_INFO_MODAL_OPEN,
  payload
} );

export const setExportModalOpen = ( payload ) => ( {
  type: SET_EXPORT_MODAL_OPEN,
  payload
} );

export const setUserInfoTemp = ( payload ) => ( {
  type: SET_USER_INFO_TEMP,
  payload
} );

export const toggleNavbarOpen = () => ( {
  type: TOGGLE_NAVBAR_OPEN,
} );

export const resetViewsUi = () => ( {
  type: RESET_VIEWS_UI
} );

/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */

const getStatePropFromActionSet = ( actionName ) => {
  return actionName.replace( 'SET_', '' ).toLowerCase().replace( /(_[a-z])/gi, ( a, b ) => b.substr( 1 ).toUpperCase() );
};

const UI_DEFAULT_STATE = {
  userInfoModalOpen: false,
  exportModalOpen: false,
  navbarOpen: false,
};

/**
 * This redux reducer handles the state of the ui
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function ui( state = UI_DEFAULT_STATE, action ) {
  const { payload } = action;
  switch ( action.type ) {

    case RESET_VIEWS_UI:
      return UI_DEFAULT_STATE;

    case SET_USER_INFO_MODAL_OPEN:
    case SET_EXPORT_MODAL_OPEN:
      const propName = getStatePropFromActionSet( action.type );
      return {
        ...state,
        [propName]: payload
      };
    case TOGGLE_NAVBAR_OPEN:
      return {
        ...state,
        navbarOpen: !state.navbarOpen,
      };
    default:
      return state;
  }
}

const DATA_DEFAULT_STATE = {
  userInfoTemp: {}
};

/**
 * This redux reducer handles the state of the temp data
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function data( state = DATA_DEFAULT_STATE, action ) {
  const { payload } = action;
  switch ( action.type ) {
    case SET_USER_INFO:
    case SET_USER_INFO_TEMP:
      return {
        ...state,
        userInfoTemp: payload,
      };
    case SET_USER_INFO_MODAL_OPEN:
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
const userInfoModalOpen = ( state ) => state.ui.userInfoModalOpen;
const exportModalOpen = ( state ) => state.ui.exportModalOpen;
const navbarOpen = ( state ) => state.ui.navbarOpen;

const userInfoTemp = ( state ) => state.data.userInfoTemp;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector( {
  userInfoModalOpen,
  exportModalOpen,
  navbarOpen,

  userInfoTemp,
} );
