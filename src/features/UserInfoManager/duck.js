/**
 * This module exports logic-related elements for managing user personal identification
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/UserInfo
 */

import { createStructuredSelector } from 'reselect';
import { saveUserInfo, loadUserInfo } from '../../helpers/localStorageUtils';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
export const SET_USER_INFO = 'SET_USER_INFO';
export const SET_USER_INFO_TEMP = 'SET_USER_INFO_TEMP';

import { SET_IDENTIFICATION_MODAL_SWITCH } from '../HomeView/duck';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setUserInfo = ( payload ) => ( {
  type: SET_USER_INFO,
  payload
} );

export const setUserInfoTemp = ( payload ) => ( {
  type: SET_USER_INFO_TEMP,
  payload
} );

const DEFAULT_USER_INFO_STATE = {

  /**
   *  User info
   */
  userInfo: loadUserInfo(),

  /**
   * temp value of user info
   */
  userInfoTemp: loadUserInfo(),
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
      saveUserInfo( action.payload );
      return {
        ...state,
        userInfo: action.payload,
        userInfoTemp: action.payload,
      };
      case SET_USER_INFO_TEMP:
        return {
          ...state,
        userInfoTemp: action.payload,
      };
      case SET_IDENTIFICATION_MODAL_SWITCH:
        if ( action.payload === false ) {
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

export const selector = createStructuredSelector( {
  userInfo: ( state ) => state.userInfo,
  userInfoTemp: ( state ) => state.userInfoTemp,
} );
