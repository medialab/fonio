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
/**
 * UI
 */
const SET_SECTION_ID_TO_BE_DELETED = 'SET_SECTION_ID_TO_BE_DELETED';
/**
 * lock system
 */
const SET_SECTIONS_ORDER_LOCK_STATE = 'SET_SECTIONS_ORDER_LOCK_STATE';
/**
 * data
 */
const SET_TEMP_SECTION_TO_CREATE = 'SET_TEMP_SECTION_TO_CREATE';
const SET_TEMP_SECTION_ID_TO_DELETE = 'SET_TEMP_SECTION_ID_TO_DELETE';
const SET_TEMP_SECTIONS_ORDER = 'SET_TEMP_SECTIONS_ORDER';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */

export const setSectionIdToBeDeleted = payload => ({
  type: SET_SECTION_ID_TO_BE_DELETED,
  payload
});

export const setTempSectionToCreate = payload => ({
  type: SET_TEMP_SECTION_TO_CREATE,
  payload
});

export const setTempSectionIdToDelete = payload => ({
  type: SET_TEMP_SECTION_ID_TO_DELETE,
  payload
});

export const setTempSectionsOrder = payload => ({
  type: SET_TEMP_SECTIONS_ORDER,
  payload
});


export const setSectionsOrderLockState = payload => ({
  type: SET_SECTIONS_ORDER_LOCK_STATE,
  payload
});
/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */


const UI_DEFAULT_STATE = {
  sectionIdToBeDeleted: undefined,
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
    case SET_SECTION_ID_TO_BE_DELETED:
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
 * Default/fallback state of the ui state
 */
const DATA_DEFAULT_STATE = {
  /**
   * New section waiting to be created (after having the lock on sectionsOrder)
   */
  tempSectionToCreate: undefined,
  /**
   * Section waiting to be deleted (after having the lock on sectionsOrder)
   */
  tempSectionIdToDelete: undefined,
  /**
   * Pending new sections order
   */
  tempSectionsOrder: undefined
};

/**
 * This redux reducer handles the global ui state management (screen & modals opening)
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function data(state = DATA_DEFAULT_STATE, action) {
  const {payload} = action;
  switch (action.type) {
    case SET_TEMP_SECTION_TO_CREATE:
    case SET_TEMP_SECTION_ID_TO_DELETE:
    case SET_TEMP_SECTIONS_ORDER:
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
   * Status of the sections order lock ([undefined, 'pending', 'success', 'fail', 'idle'])
   */
  sectionsOrderLockState: undefined,
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
    case SET_SECTIONS_ORDER_LOCK_STATE :
      return {
        sectionsOrderLockState: payload,
      };
    case `${ENTER_BLOCK}`:
      if (payload.location === 'sections') {
        return {
          ...state,
          viewLockState: 'pending'
        };
      }
      else if (payload.location === 'sectionsOrder') {
        return {
          ...state,
          sectionsOrderLockState: 'pending'
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
      else if (payload.location === 'sectionsOrder') {
        return {
          ...state,
          sectionsOrderLockState: 'success'
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
      else if (payload.location === 'sectionsOrder') {
        return {
          ...state,
          sectionsOrderLockState: 'fail'
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
  data,
  lockManagement,
});

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */
const sectionsOrderLockState = state => state.lockManagement.sectionsOrderLockState;

const tempSectionToCreate = state => state.data.tempSectionToCreate;
const tempSectionIdToDelete = state => state.data.tempSectionIdToDelete;
const tempSectionsOrder = state => state.data.tempSectionsOrder;


/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  sectionsOrderLockState,

  tempSectionToCreate,
  tempSectionIdToDelete,
  tempSectionsOrder,
});
