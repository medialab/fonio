/**
 * This module exports logic-related elements for the fonio user info feature
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/UserInfo
 */

import { createStructuredSelector } from 'reselect';
import { saveUserInfo } from '../../helpers/localStorageUtils';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
export const SET_USER_INFO = 'SET_USER_INFO';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setUserInfo = ( payload ) => ( {
  type: SET_USER_INFO,
  payload
} );

const DEFAULT_USER_INFO_STATE = {
  userInfo: undefined
};

/**
 * Reducer for the user info function
 * @param {object} state
 * @param {object} action
 * @return {object} newState
 */
export default function userInfo( state = DEFAULT_USER_INFO_STATE, action ) {
  switch ( action.type ) {
    case SET_USER_INFO:
      saveUserInfo( {
        ...action.payload,
        userInfo: undefined
      } );
      return action.payload;
    default:
      return state;
  }
}

export const selector = createStructuredSelector( {
  userInfo: ( state ) => state,
} );
