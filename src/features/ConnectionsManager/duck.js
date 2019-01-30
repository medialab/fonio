/**
 * This module exports logic-related elements for socket-related features
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/ConnectionsManager
 */
import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';
import { post } from 'axios';

import config from '../../config';

import { updateEditionHistoryMap } from '../../helpers/localStorageUtils';

import { ACTIVATE_STORY } from '../StoryManager/duck';

const SET_SOCKET_ID = 'SET_SOCKET_ID';
export const ENTER_STORY = 'ENTER_STORY';
export const LEAVE_STORY = 'LEAVE_STORY';
export const ENTER_BLOCK = 'ENTER_BLOCK';
export const LEAVE_BLOCK = 'LEAVE_BLOCK';
const IDLE_BLOCK = 'IDLE_BLOCK';

const USER_CONNECTED = 'USER_CONNECTED';
const USER_DISCONNECTING = 'USER_DISCONNECTING';
const USER_DISCONNECTED = 'USER_DISCONNECTED';
const SET_USER_AS_IDLE_BROADCAST = 'SET_USER_AS_IDLE_BROADCAST';
const SET_USER_AS_ACTIVE_BROADCAST = 'SET_USER_AS_ACTIVE_BROADCAST';

const CREATE_USER = 'CREATE_USER';

export const LOGIN_STORY = 'LOGIN_STORY';

const LOCKING_DEFAULT_STATE = {};

export const createUser = ( payload ) => ( {
  type: CREATE_USER,
  payload,
  meta: {
    remote: true,
    broadcast: true,
  },
} );

export const enterStory = ( payload ) => ( {
  type: ENTER_STORY,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    // room: payload.storyId,
  },
} );

export const leaveStory = ( payload ) => ( {
  type: LEAVE_STORY,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    noLock: payload.noLock,
    // room: payload.storyId,
  },
} );

export const enterBlock = ( payload, callback ) => ( {
  type: ENTER_BLOCK,
  payload,
  callback,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
    blockType: payload.blockType,
    blockId: payload.blockId,
    noLock: payload.noLock
  },
} );

export const idleBlock = ( payload ) => ( {
  type: IDLE_BLOCK,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,
    blockType: payload.blockType,
    blockId: payload.blockId,
  },
} );

export const leaveBlock = ( payload ) => ( {
  type: LEAVE_BLOCK,
  payload,
  meta: {
    remote: true,
    broadcast: true,
    room: payload.storyId,

    /*
     * blockType: payload.blockType,
     * blockId: payload.blockId,
     */
  },
} );

export const loginStory = ( payload ) => ( {
  type: LOGIN_STORY,
  storyId: payload.storyId,
  promise: () => {
    const serverRequestUrl = `${config.restUrl }/auth/login`;
    return post( serverRequestUrl, payload );
  },
} );

const USERS_DEFAULT_STATE = {
  userId: undefined,
  count: 0,
  users: {}
};

/**
 * This redux reducer handles the users information
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function users( state = USERS_DEFAULT_STATE, action ) {
  const { payload } = action;
  switch ( action.type ) {
    case SET_SOCKET_ID:
      return {
        ...state,
        userId: action.payload,
      };
    case CREATE_USER:
    case `${CREATE_USER}_BROADCAST`:
      return {
        ...state,
        users: {
          ...state.users,
          [payload.userId]: payload,
        },
      };
    case USER_CONNECTED:
    case USER_DISCONNECTED:
      return {
        ...state,
        ...payload.users,
      };
    default:
      return state;
  }
}
const DEFAULT_LOCKS = {
};

/**
 * This redux reducer handles the locking state
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function locking( state = LOCKING_DEFAULT_STATE, action ) {
  const { payload } = action;
  let locks;
  let userLocks;
  let newLocks;
  switch ( action.type ) {
    case USER_CONNECTED:
    case USER_DISCONNECTED:
      if ( payload && payload.locking ) {
        return { ...payload.locking };
      }
      return state;

    case `${ACTIVATE_STORY}_SUCCESS`:
    case ENTER_STORY:
    case `${ENTER_STORY}_BROADCAST`:
      locks = ( state[payload.storyId] && state[payload.storyId].locks ) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          locks: {
            ...locks,
            [payload.userId]: DEFAULT_LOCKS,
          },
        },
      };
    case LEAVE_STORY:
    case `${LEAVE_STORY}_BROADCAST`:
      locks = ( state[payload.storyId] && state[payload.storyId].locks ) || {};
      delete locks[payload.userId];
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          locks,
        },
      };

    /*
     * case CREATE_SECTION:
     * case `${CREATE_SECTION}_BROADCAST`:
     *   locks = (state[payload.storyId] && state[payload.storyId].locks) || {};
     *   return {
     *     ...state,
     *     [payload.storyId]: {
     *       ...state[payload.storyId],
     *       locks: {
     *         ...locks,
     *         [payload.userId]: {
     *           ...locks[payload.userId],
     *           sections: {
     *             blockId: payload.sectionId,
     *             status: 'active',
     *             blockType: 'sections',
     *           },
     *         },
     *       },
     *     },
     *   };
     */
    case `${ENTER_BLOCK}_SUCCESS`:
    case `${ENTER_BLOCK}_BROADCAST`:
      locks = ( state[payload.storyId] && state[payload.storyId].locks ) || {};
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          locks: {
            ...locks,
            [payload.userId]: {
              ...locks[payload.userId],
              [payload.blockType]: {
                ...payload,
                status: 'active',
              },
              status: 'active'
            },
          },
        },
      };
    case SET_USER_AS_IDLE_BROADCAST:
      locks = ( state[payload.storyId] && state[payload.storyId].locks ) || {};
      userLocks = locks[payload.userId] || {};
      newLocks = Object.keys( userLocks ).reduce( ( result, key ) => {
        const val = userLocks[key];
        if ( typeof val === 'object' && val.status ) {
          return {
            ...result,
            [key]: {
              ...val,
              status: 'idle'
            }
          };
        }
        return {
          ...result,
          [key]: val
        };
      }, {} );
      newLocks.status = 'idle';
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          locks: {
            ...locks,
            [payload.userId]: newLocks,
          },
        }
      };
    case SET_USER_AS_ACTIVE_BROADCAST:
      locks = ( state[payload.storyId] && state[payload.storyId].locks ) || {};
      userLocks = locks[payload.userId] || {};
      newLocks = Object.keys( userLocks ).reduce( ( result, key ) => {
        const val = userLocks[key];
        if ( typeof val === 'object' && val.status ) {
          return {
            ...result,
            [key]: {
              ...val,
              status: 'active'
            }
          };
        }
        return {
          ...result,
          [key]: val
        };
      }, {} );
      newLocks.status = 'active';
      return {
        ...state,
        [payload.storyId]: {
          ...state[payload.storyId],
          locks: {
            ...locks,
            [payload.userId]: newLocks,
          },
        }
      };

    case LEAVE_BLOCK:
    case `${LEAVE_BLOCK}_BROADCAST`:
      locks = ( state[payload.storyId] && state[payload.storyId].locks ) || {};
      if ( locks[payload.userId] ) {
        return {
          ...state,
          [payload.storyId]: {
            ...state[payload.storyId],
            locks: {
              ...locks,
              [payload.userId]: {
                ...locks[payload.userId],
                [payload.blockType]: undefined,
                status: 'active'
              },
            },
          },
        };
      }
      else return state;

    /**
     * update locking system by room manually (client)
     */
    case USER_DISCONNECTING:
      const newState = { ...state };
      payload.rooms.forEach( ( room ) => {
        if ( newState[room] && newState[room].locks ) {
          delete newState[room].locks[payload.userId];
        }
      } );
      return newState;
    default:
      return state;

  }
}

export default combineReducers( {
  locking,
  users,
} );

const userId = ( state ) => state.users.userId;
const activeUsers = ( state ) => state.users.users;
const usersNumber = ( state ) => state.users.count;
const lockingMap = ( state ) => state.locking;

export const selector = createStructuredSelector( {
  userId,
  usersNumber,
  lockingMap,
  activeUsers,
} );
