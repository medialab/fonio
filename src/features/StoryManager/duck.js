/**
 * This module exports logic-related elements for the fonio story manager
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StoryManager
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';

import {get} from 'axios';

import {updateEditionHistoryMap} from '../../helpers/localStorageUtils';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
export const ACTIVATE_STORY = 'ACTIVATE_STORY';
/**
 * Section small objects
 */
export const UPDATE_STORY_METADATA = 'UPDATE_STORY_METADATA';
export const UPDATE_STORY_SETTINGS = 'UPDATE_STORY_SETTINGS';
export const UPDATE_SECTIONS_ORDER = 'UPDATE_SECTIONS_ORDER';

/**
 * sections CRUD
 */
export const CREATE_SECTION = 'CREATE_SECTION';
export const UPDATE_SECTION = 'UPDATE_SECTION';
export const DELETE_SECTION = 'DELETE_SECTION';
/**
 * resources CRUD
 */
export const CREATE_RESOURCE = 'CREATE_RESOURCE';
export const UPDATE_RESOURCE = 'UPDATE_RESOURCE';
export const DELETE_RESOURCE = 'DELETE_RESOURCE';

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const activateStory = payload => ({
  type: ACTIVATE_STORY,
  payload,
  promise: () => {
    const {storyId, userId, token} = payload;
    const serverRequestUrl = `${CONFIG.serverUrl}/stories/${storyId}?userId=${userId}&edit=true`;/* eslint no-undef : 0 */
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    return get(serverRequestUrl, options);
  },
});

/**
 * Template for all story change related actions
 */
export const updateStory = (TYPE, payload, callback) => {
  updateEditionHistoryMap(payload.storyId);
  return {
    type: TYPE,
    payload: {
      ...payload,
      lastUpdateAt: new Date().getTime(),
    },
    callback,
    meta: {
      remote: true,
      broadcast: true,
      room: payload.storyId,
    },
  };
};

/**
 * Action creators related to socket-based edited story data edition
 */
export const updateStoryMetadata = payload => updateStory(UPDATE_STORY_METADATA, payload);
export const updateStorySettings = payload => updateStory(UPDATE_STORY_SETTINGS, payload);
export const updateSectionsOrder = payload => updateStory(UPDATE_SECTIONS_ORDER, payload);
export const createSection = payload => updateStory(CREATE_SECTION, payload);
export const updateSection = payload => updateStory(UPDATE_SECTION, payload);
export const deleteSection = (payload, callback) => updateStory(DELETE_SECTION, payload, callback);
export const createResource = payload => updateStory(CREATE_RESOURCE, payload);
export const updateResource = payload => updateStory(UPDATE_RESOURCE, payload);
export const deleteResource = (payload, callback) => updateStory(DELETE_RESOURCE, payload, callback);

/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */

const STORY_DEFAULT_STATE = {};

/**
 * This redux reducer handles the state of edited story
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function story(state = STORY_DEFAULT_STATE, action) {
  const {result, payload} = action;
  switch (action.type) {
    case `${ACTIVATE_STORY}_SUCCESS`:
      return result.data;
    /**
     * STORY METADATA
     */
    case UPDATE_STORY_METADATA:
    case `${UPDATE_STORY_METADATA}_BROADCAST`:
      return {
          ...state,
          metadata: {...payload.metadata},
          lastUpdateAt: payload.lastUpdateAt,
      };
    /**
     * STORY SETTINGS
     */
    case `${UPDATE_STORY_SETTINGS}`:
    case `${UPDATE_STORY_SETTINGS}_BROADCAST`:
      return {
          ...state,
          settings: {...payload.settings},
          lastUpdateAt: payload.lastUpdateAt,
      };
    /**
     * SECTIONS ORDER
     */
    case `${UPDATE_SECTIONS_ORDER}`:
    case `${UPDATE_SECTIONS_ORDER}_BROADCAST`:
      const oldSectionsOrder = [...state.sectionsOrder];
      const newSectionsOrder = [...payload.sectionsOrder];
      let resolvedSectionsOrder = [...payload.sectionsOrder];
      // new order is bigger than older order
      // (probably because a user deleted a section in the meantime)
      // --> we filter the new order with only existing sections
      if (newSectionsOrder.length > oldSectionsOrder.length) {
          resolvedSectionsOrder = newSectionsOrder.filter(
            newSectionId => oldSectionsOlder.indexOf(newSectionId) > -1
          );
      // new order is smaller than older order
      // (probably because a user created a section in the meantime)
      // --> we add created sections to the new sections
      }
 else if (newSectionsOrder.length < oldSectionsOrder.length) {
        resolvedSectionsOrder = [
          ...newSectionsOrder,
          ...oldSectionsOrder.slice(newSectionsOrder.length)
        ];
      }
      return {
          ...state,
          sectionsOrder: [...resolvedSectionsOrder],
          lastUpdateAt: payload.lastUpdateAt,
      };
    /**
     * SECTION CRUD
     */
    case `${CREATE_SECTION}`:
    case `${CREATE_SECTION}_BROADCAST`:
      return {
          ...state,
          sections: {
            ...state.sections,
            [payload.sectionId]: {
              ...payload.section
            }
          },
          sectionsOrder: [
            ...state.sectionsOrder,
            payload.sectionId
          ],
          lastUpdateAt: payload.lastUpdateAt,
      };
    case `${UPDATE_SECTION}`:
    case `${UPDATE_SECTION}_BROADCAST`:
      return {
          ...state,
          sections: {
            ...state.sections,
            [payload.sectionId]: {
              ...payload.section
            }
          },
          lastUpdateAt: payload.lastUpdateAt,
      };
    case `${DELETE_SECTION}`:
    case `${DELETE_SECTION}_BROADCAST`:
      return {
          ...state,
          sections: Object.keys(state.sections)
            .reduce((thatResult, thatSectionId) => {
              if (thatSectionId === payload.sectionId) {
                return thatResult;
              }
              else return {
                ...thatResult,
                [thatSectionId]: state.sections[thatSectionId]
              };
            }, {}),
          sectionsOrder: state.sectionsOrder.filter(id => id !== payload.sectionId),
          lastUpdateAt: payload.lastUpdateAt,
      };
    /**
     * STORY RESOURCES
     */
    case `${CREATE_RESOURCE}`:
    case `${CREATE_RESOURCE}_BROADCAST`:
    case `${UPDATE_RESOURCE}`:
    case `${UPDATE_RESOURCE}_BROADCAST`:
      return {
          ...state,
          resources: {
            ...state.resources,
            [payload.resourceId]: {
              ...payload.resource
            }
          },
          lastUpdateAt: payload.lastUpdateAt,
      };
    case `${DELETE_RESOURCE}`:
    case `${DELETE_RESOURCE}_BROADCAST`:
      return {
          ...state,
          resources: Object.keys(state.resources)
            .reduce((thatResult, thatResourceId) => {
              if (thatResourceId === payload.resourceId) {
                return thatResult;
              }
              else return {
                ...thatResult,
                [thatResourceId]: state.resources[thatResourceId]
              };
            }, {}),
          lastUpdateAt: payload.lastUpdateAt,
      };

    default:
      return state;
  }
}

/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers({
  story
});

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */

const editedStory = state => state.story;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  editedStory
});
