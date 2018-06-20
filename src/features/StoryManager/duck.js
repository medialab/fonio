/**
 * This module exports logic-related elements for the fonio story manager
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StoryManager
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';

import {get, post, put, del} from 'axios';

import {updateEditionHistoryMap, loadStoryToken} from '../../helpers/localStorageUtils';

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

export const CREATE_CONTEXTUALIZER = 'CREATE_CONTEXTUALIZER';
export const UPDATE_CONTEXTUALIZER = 'UPDATE_CONTEXTUALIZER';
export const DELETE_CONTEXTUALIZER = 'DELETE_CONTEXTUALIZER';

export const CREATE_CONTEXTUALIZATION = 'CREATE_CONTEXTUALIZATION';
export const UPDATE_CONTEXTUALIZATION = 'UPDATE_CONTEXTUALIZATION';
export const DELETE_CONTEXTUALIZATION = 'DELETE_CONTEXTUALIZATION';


export const UPLOAD_RESOURCE = 'UPLOAD_RESOURCE';
export const DELETE_UPLOADED_RESOURCE = 'DELETE_UPLOADED_RESOURCE';
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
    const serverRequestUrl = `${CONFIG.apiUrl}/stories/${storyId}?userId=${userId}&edit=true`;
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
  let blockType;
  let blockId;
  switch (TYPE) {
    case UPDATE_STORY_METADATA:
      blockType = 'storyMetadata';
      blockId = 'storyMetadata';
      break;
    case UPDATE_STORY_SETTINGS:
      blockType = 'settings';
      blockId = 'settings';
      break;
    case DELETE_SECTION:
    case UPDATE_SECTION:
      blockType = 'sections';
      blockId = payload.sectionId;
      break;
    case DELETE_RESOURCE:
    case UPDATE_RESOURCE:
      blockType = 'resources';
      blockId = payload.resourceId;
      break;
    default:
      blockType = undefined;
      blockId = undefined;
      break;
  }
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
      userId: payload.userId,
      blockType,
      blockId,
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

export const createContextualizer = payload => updateStory(CREATE_CONTEXTUALIZER, payload);
export const updateContextualizer = payload => updateStory(UPDATE_CONTEXTUALIZER, payload);
export const deleteContextualizer = payload => updateStory(DELETE_CONTEXTUALIZER, payload);

export const createContextualization = payload => updateStory(CREATE_CONTEXTUALIZATION, payload);
export const updateContextualization = payload => updateStory(UPDATE_CONTEXTUALIZATION, payload);
export const deleteContextualization = payload => updateStory(DELETE_CONTEXTUALIZATION, payload);

/**
 * Action creators related to resource upload request
 */
export const uploadResource = (payload, mode) => ({
  type: UPLOAD_RESOURCE,
  payload,
  promise: () => {
    const token = loadStoryToken(payload.storyId);
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    let serverRequestUrl;
    if (mode === 'create') {
      serverRequestUrl = `${CONFIG.apiUrl}/resources/${payload.storyId}?userId=${payload.userId}&lastUpdateAt=${payload.lastUpdateAt}`;
      return post(serverRequestUrl, payload.resource, options);
    }
    serverRequestUrl = `${CONFIG.apiUrl}/resources/${payload.storyId}/${payload.resourceId}?userId=${payload.userId}&lastUpdateAt=${payload.lastUpdateAt}`;
    return put(serverRequestUrl, payload.resource, options);
  },
});

export const deleteUploadedResource = payload => ({
  type: DELETE_UPLOADED_RESOURCE,
  payload,
  promise: () => {
    const token = loadStoryToken(payload.storyId);
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    const serverRequestUrl = `${CONFIG.apiUrl}/resources/${payload.storyId}/${payload.resourceId}?userId=${payload.userId}&lastUpdateAt=${payload.lastUpdateAt}`;
    return del(serverRequestUrl, options);
  },
});
/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */

const STORY_DEFAULT_STATE = {
  story: undefined
};

/**
 * This redux reducer handles the state of edited story
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function story(state = STORY_DEFAULT_STATE, action) {
  const {result, payload} = action;
  let contextualizers;
  switch (action.type) {
    case `${ACTIVATE_STORY}_SUCCESS`:
      return {
        ...state,
        story: result.data
      };
    /**
     * STORY METADATA
     */
    case `${UPDATE_STORY_METADATA}_SUCCESS`:
    case `${UPDATE_STORY_METADATA}_BROADCAST`:
      return {
          ...state,
          story: {
            ...state.story,
            metadata: {...payload.metadata},
            lastUpdateAt: payload.lastUpdateAt,
          }
      };
    /**
     * STORY SETTINGS
     */
    case `${UPDATE_STORY_SETTINGS}_SUCCESS`:
    case `${UPDATE_STORY_SETTINGS}_BROADCAST`:
      return {
          ...state,
          story: {
            ...state.story,
            settings: {...payload.settings},
            lastUpdateAt: payload.lastUpdateAt,
          }
      };
    /**
     * SECTIONS ORDER
     */
    case `${UPDATE_SECTIONS_ORDER}`:
    case `${UPDATE_SECTIONS_ORDER}_BROADCAST`:
      const oldSectionsOrder = [...state.story.sectionsOrder];
      const newSectionsOrder = [...payload.sectionsOrder];
      let resolvedSectionsOrder = [...payload.sectionsOrder];
      // new order is bigger than older order
      // (probably because a user deleted a section in the meantime)
      // --> we filter the new order with only existing sections
      if (newSectionsOrder.length > oldSectionsOrder.length) {
          resolvedSectionsOrder = newSectionsOrder.filter(
            newSectionId => oldSectionsOrder.indexOf(newSectionId) > -1
          );
      // new order is smaller than older order
      // (probably because a user created a section in the meantime)
      // --> we add created sections to the new sections order
      }
      else if (newSectionsOrder.length < oldSectionsOrder.length) {
        resolvedSectionsOrder = [
          ...newSectionsOrder,
          ...oldSectionsOrder.slice(newSectionsOrder.length)
        ];
      }
      return {
          ...state,
          story: {
            ...state.story,
            sectionsOrder: [...resolvedSectionsOrder],
            lastUpdateAt: payload.lastUpdateAt,
          }
      };
    /**
     * SECTION CRUD
     */
    case `${CREATE_SECTION}`:
    case `${CREATE_SECTION}_BROADCAST`:
      return {
          ...state,
          story: {
            ...state.story,
            sections: {
              ...state.story.sections,
              [payload.sectionId]: {
                ...payload.section,
                lastUpdateAt: payload.lastUpdateAt,
              }
            },
            sectionsOrder: [
              ...state.story.sectionsOrder,
              payload.sectionId
            ],
            lastUpdateAt: payload.lastUpdateAt,
          }
      };
    case `${UPDATE_SECTION}_SUCCESS`:
    case `${UPDATE_SECTION}_BROADCAST`:
      return {
          ...state,
          story: {
            ...state.story,
            sections: {
              ...state.story.sections,
              [payload.sectionId]: {
                ...payload.section,
                lastUpdateAt: payload.lastUpdateAt,
              }
            },
            lastUpdateAt: payload.lastUpdateAt,
          }
      };
    case `${DELETE_SECTION}_SUCCESS`:
    case `${DELETE_SECTION}_BROADCAST`:
      return {
          ...state,
          story: {
            ...state.story,
            sections: Object.keys(state.story.sections)
              .reduce((thatResult, thatSectionId) => {
                if (thatSectionId === payload.sectionId) {
                  return thatResult;
                }
                else return {
                  ...thatResult,
                  [thatSectionId]: state.story.sections[thatSectionId]
                };
              }, {}),
            sectionsOrder: state.story.sectionsOrder.filter(id => id !== payload.sectionId),
            lastUpdateAt: payload.lastUpdateAt,
          }

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
          story: {
            ...state.story,
            resources: {
              ...state.story.resources,
              [payload.resourceId]: {
                ...payload.resource,
                lastUpdateAt: payload.lastUpdateAt,
              }
            },
            lastUpdateAt: payload.lastUpdateAt,
          }
      };
    case `${UPLOAD_RESOURCE}_SUCCESS`:
      return {
        ...state,
        story: {
          ...state.story,
          resources: {
            ...state.resources,
            [payload.resourceId]: result.data,
            lastUpdateAt: payload.lastUpdateAt,
          },
          lastUpdateAt: payload.lastUpdateAt,
        }
      };
    case `${DELETE_RESOURCE}`:
    case `${DELETE_RESOURCE}_BROADCAST`:
    case `${DELETE_UPLOADED_RESOURCE}_SUCCESS`:
      return {
          ...state,
          story: {
            ...state.story,
            resources: Object.keys(state.story.resources)
              .reduce((thatResult, thatResourceId) => {
                if (thatResourceId === payload.resourceId) {
                  return thatResult;
                }
                else return {
                  ...thatResult,
                  [thatResourceId]: state.story.resources[thatResourceId]
                };
              }, {}),
            lastUpdateAt: payload.lastUpdateAt,
          }
      };

    /**
     * CONTEXTUALIZATION RELATED
     */
    // contextualizations CUD
    case UPDATE_CONTEXTUALIZATION:
    case `${UPDATE_CONTEXTUALIZATION}_BROADCAST`:
    case CREATE_CONTEXTUALIZATION:
    case `${CREATE_CONTEXTUALIZATION}_BROADCAST`:
      const {
        contextualizationId,
        contextualization
      } = payload;
      return {
        ...state,
        story: {
          ...state.story,
          contextualizations: {
            ...state.story.contextualizations,
            [contextualizationId]: contextualization
          }
        }
      };
    case DELETE_CONTEXTUALIZATION:
    case `${DELETE_CONTEXTUALIZATION}_BROADCAST`:
      const contextualizations = {...state.story.contextualizations};
      delete contextualizations[payload.contextualizationId];
      return {
        ...state,
        story: {
          ...state.story,
          contextualizations
        }
      };

    /**
     * CONTEXTUALIZER RELATED
     */
    // contextualizers CUD
    case UPDATE_CONTEXTUALIZER:
    case `${UPDATE_CONTEXTUALIZER}_BROADCAST`:
    case CREATE_CONTEXTUALIZER:
    case `${CREATE_CONTEXTUALIZER}_BROADCAST`:
      // storyId = action.storyId;
      const {
        contextualizerId,
        contextualizer
      } = payload;
      return {
        ...state,
        story: {
          ...state.story,
          contextualizers: {
            ...state.story.contextualizers,
            [contextualizerId]: contextualizer
          }
        }
      };
    case DELETE_CONTEXTUALIZER:
    case `${DELETE_CONTEXTUALIZER}_BROADCAST`:
      contextualizers = {...state.story.contextualizers};
      delete contextualizers[payload.contextualizerId];
      return {
        ...state,
        story: {
          ...state.story,
          contextualizers
        }
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

const editedStory = state => state.story.story;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  editedStory
});
