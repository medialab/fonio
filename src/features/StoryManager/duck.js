/**
 * This module exports logic-related elements for the fonio story manager
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StoryManager
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';

import {get, post, put, delete as del} from 'axios';
import Ajv from 'ajv';

import storySchema from 'quinoa-schemas/story';
import resourceSchema from 'quinoa-schemas/resource';


import {LEAVE_STORY} from '../ConnectionsManager/duck';

import config from '../../config';

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
export const SET_SECTION_LEVEL = 'SET_SECTION_LEVEL';
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

export const SET_COVER_IMAGE = 'SET_COVER_IMAGE';

export const UPLOAD_RESOURCE = 'UPLOAD_RESOURCE';
export const DELETE_UPLOADED_RESOURCE = 'DELETE_UPLOADED_RESOURCE';

/**
 * ===================================================
 * ACTION PAYLOAD SCHEMA
 * ===================================================
 */
const ajv = new Ajv();

const DEFAULT_PAYLOAD_SCHEMA = {
  type: 'object',
  properties: {
    storyId: storySchema.properties.id
  }
};
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
    const serverRequestUrl = `${config.restUrl}/stories/${storyId}?userId=${userId}&edit=true`;
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

  let payloadSchema = DEFAULT_PAYLOAD_SCHEMA;
  const sectionSchema = storySchema.properties.sections.patternProperties['[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'];

  switch (TYPE) {
    case UPDATE_STORY_METADATA:
      blockType = 'storyMetadata';
      blockId = 'storyMetadata';
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          metadata: storySchema.definitions.metadata,
        }
      };
      break;
    case UPDATE_STORY_SETTINGS:
      blockType = 'settings';
      blockId = 'settings';
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          settings: storySchema.properties.settings
        }
      };
      break;
    case UPDATE_SECTIONS_ORDER:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          sectionsOrder: storySchema.properties.sectionsOrder,
        }
      };
      break;
    case SET_SECTION_LEVEL:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          sectionId: sectionSchema.properties.id,
          level: storySchema.definitions.metadata.properties.level,
        }
      };
      break;
    case CREATE_SECTION:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          sectionId: sectionSchema.properties.id,
          section: sectionSchema.properties
        }
      };
      break;
    case UPDATE_SECTION:
      blockType = 'sections';
      blockId = payload.sectionId;
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          sectionId: sectionSchema.properties.id,
          section: sectionSchema.properties
        }
      };
      break;
    case DELETE_SECTION:
      blockType = 'sections';
      blockId = payload.sectionId;
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          sectionId: sectionSchema.properties.id,
        }
      };
      break;
    case CREATE_CONTEXTUALIZATION:
    case UPDATE_CONTEXTUALIZATION:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          contextualization: storySchema.definitions.contextualization
        }
      };
      break;
    case DELETE_CONTEXTUALIZATION:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          contextualizationId: storySchema.definitions.contextualization.properties.id
        }
      };
      break;
    case CREATE_CONTEXTUALIZER:
    case UPDATE_CONTEXTUALIZER:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          contextualizer: storySchema.definitions.contextualizer
        }
      };
      break;
    case DELETE_CONTEXTUALIZER:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          contextualizerId: storySchema.definitions.contextualizer.properties.id
        }
      };
      break;
    case CREATE_RESOURCE:
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          resourceId: resourceSchema.properties.id,
          resource: {
            type: resourceSchema.type,
            properties: resourceSchema.properties,
          }
        },
        definitions: resourceSchema.definitions,
      };
      break;
    case UPDATE_RESOURCE:
      blockType = 'resources';
      blockId = payload.resourceId;
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          resourceId: resourceSchema.properties.id,
          resource: {
            type: resourceSchema.type,
            properties: resourceSchema.properties,
          }
        },
        definitions: resourceSchema.definitions,
      };
      break;
    case DELETE_RESOURCE:
      blockType = 'resources';
      blockId = payload.resourceId;
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          resourceId: resourceSchema.properties.id
        }
      };
      break;
    default:
      blockType = undefined;
      blockId = undefined;
      payloadSchema = DEFAULT_PAYLOAD_SCHEMA;
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
      validator: {
        payload: {
          func: () => {
            const val = ajv.compile(payloadSchema);
            return val(payload);
          },
          msg: 'payload is not valid',
        },
      },
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
export const setSectionLevel = (payload, callback) => updateStory(SET_SECTION_LEVEL, payload, callback);

export const createResource = payload => updateStory(CREATE_RESOURCE, payload);
export const updateResource = payload => updateStory(UPDATE_RESOURCE, payload);
export const deleteResource = (payload, callback) => updateStory(DELETE_RESOURCE, payload, callback);

export const createContextualizer = payload => updateStory(CREATE_CONTEXTUALIZER, payload);
export const updateContextualizer = payload => updateStory(UPDATE_CONTEXTUALIZER, payload);
export const deleteContextualizer = payload => updateStory(DELETE_CONTEXTUALIZER, payload);

export const createContextualization = payload => updateStory(CREATE_CONTEXTUALIZATION, payload);
export const updateContextualization = payload => updateStory(UPDATE_CONTEXTUALIZATION, payload);
export const deleteContextualization = payload => updateStory(DELETE_CONTEXTUALIZATION, payload);

export const setCoverImage = payload => updateStory(SET_COVER_IMAGE, payload);
/**
 * Action creators related to resource upload request
 */
export const uploadResource = (payload, mode) => ({
  type: UPLOAD_RESOURCE,
  payload: {
    ...payload,
    lastUpdateAt: new Date().getTime()
  },
  promise: () => {
    const token = loadStoryToken(payload.storyId);
    const lastUpdateAt = new Date().getTime();
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    let serverRequestUrl;
    if (mode === 'create') {
      serverRequestUrl = `${config.restUrl}/resources/${payload.storyId}?userId=${payload.userId}&lastUpdateAt=${lastUpdateAt}`;
      return post(serverRequestUrl, payload.resource, options);
    }
    serverRequestUrl = `${config.restUrl}/resources/${payload.storyId}/${payload.resourceId}?userId=${payload.userId}&lastUpdateAt=${lastUpdateAt}`;
    return put(serverRequestUrl, payload.resource, options);
  },
});

export const deleteUploadedResource = payload => ({
  type: DELETE_UPLOADED_RESOURCE,
  payload,
  promise: () => {
    const token = loadStoryToken(payload.storyId);
    const lastUpdateAt = new Date().getTime();
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    const serverRequestUrl = `${config.restUrl}/resources/${payload.storyId}/${payload.resourceId}?userId=${payload.userId}&lastUpdateAt=${lastUpdateAt}`;
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
  let contextualizations;
  let contextualizers;
  let contextualizersToDeleteIds;
  let contextualizationsToDeleteIds;
  let createdAt;
  switch (action.type) {
    case LEAVE_STORY:
      return {
        ...state,
        story: undefined,
      };
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
      if (!state.story) {
        return state;
      }
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
      if (!state.story) {
        return state;
      }
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
      if (!state.story) {
        return state;
      }
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
      if (!state.story) {
        return state;
      }
      return {
          ...state,
          story: {
            ...state.story,
            sections: {
              ...state.story.sections,
              [payload.sectionId]: {
                ...payload.section,
                lastUpdateAt: payload.lastUpdateAt,
                createdAt: payload.lastUpdateAt,
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
      if (!state.story) {
        return state;
      }
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
    case `${SET_SECTION_LEVEL}`:
    case `${SET_SECTION_LEVEL}_SUCCESS`:
    case `${SET_SECTION_LEVEL}_BROADCAST`:
      if (!state.story) {
        return state;
      }
      return {
          ...state,
          story: {
            ...state.story,
            sections: {
              ...state.story.sections,
              [payload.sectionId]: {
                ...state.story.sections[payload.sectionId],
                metadata: {
                  ...state.story.sections[payload.sectionId].metadata,
                  level: payload.level
                },
                lastUpdateAt: payload.lastUpdateAt,
              }
            },
            lastUpdateAt: payload.lastUpdateAt,
          }
      };
    case `${DELETE_SECTION}_SUCCESS`:
    case `${DELETE_SECTION}_BROADCAST`:
      if (!state.story) {
        return state;
      }
      contextualizations = {...state.story.contextualizations};
      contextualizers = {...state.story.contextualizers};

      contextualizationsToDeleteIds = Object.keys(contextualizations)
      .filter(id => {
        return contextualizations[id].sectionId === payload.sectionId;
      });
      contextualizersToDeleteIds = [];

      contextualizationsToDeleteIds
      .forEach((id) => {
        contextualizersToDeleteIds.push(contextualizations[id].contextualizerId);
      });

      contextualizersToDeleteIds.forEach(contextualizerId => {
        delete contextualizers[contextualizerId];
      });
      contextualizationsToDeleteIds.forEach(contextualizationId => {
        delete contextualizations[contextualizationId];
      });
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
            contextualizations,
            contextualizers,
            sectionsOrder: state.story.sectionsOrder.filter(id => id !== payload.sectionId),
            lastUpdateAt: payload.lastUpdateAt,
          }

      };
    /**
     * STORY RESOURCES
     */
    case `${CREATE_RESOURCE}`:
      createdAt = payload.lastUpdateAt; /* eslint no-fallthrough : 0 */
    case `${CREATE_RESOURCE}_BROADCAST`:
    case `${UPDATE_RESOURCE}`:
    case `${UPDATE_RESOURCE}_BROADCAST`:
      if (!state.story) {
        return state;
      }
      return {
          ...state,
          story: {
            ...state.story,
            resources: {
              ...state.story.resources,
              [payload.resourceId]: {
                ...payload.resource,
                lastUpdateAt: payload.lastUpdateAt,
                createdAt: createdAt ? createdAt : state.story.resources[payload.resourceId].createdAt
              }
            },
            lastUpdateAt: payload.lastUpdateAt,
          }
      };
    case `${UPLOAD_RESOURCE}_SUCCESS`:
      if (!state.story) {
        return state;
      }
      return {
        ...state,
        story: {
          ...state.story,
          resources: {
            ...state.story.resources,
            [payload.resourceId]: {
              ...result.data,
              lastUpdateAt: payload.lastUpdateAt,
            },
          },
          lastUpdateAt: payload.lastUpdateAt,
        }
      };
    case `${DELETE_RESOURCE}_SUCCESS`:
    case `${DELETE_RESOURCE}_BROADCAST`:
    case `${DELETE_UPLOADED_RESOURCE}_SUCCESS`:
      if (!state.story) {
        return state;
      }
      contextualizations = {...state.story.contextualizations};
      contextualizers = {...state.story.contextualizers};
      // for now as the app does not allow to reuse the same contextualizer for several resources
      // we will delete associated contextualizers as well as associated contextualizations
      // (forseeing long edition sessions in which user create and delete a large number of contextualizations
      // if not doing so we would end up with a bunch of unused contextualizers in documents' data after a while)

      // we will store contextualizers id to delete here
      contextualizersToDeleteIds = [];

      // we will store contextualizations id to delete here
      contextualizationsToDeleteIds = [];
      // spot all objects to delete
      Object.keys(contextualizations)
        .forEach(contextualizationId => {
          if (contextualizations[contextualizationId].resourceId === payload.resourceId) {
            contextualizationsToDeleteIds.push(contextualizationId);
            contextualizersToDeleteIds.push(contextualizations[contextualizationId].contextualizerId);
          }
        });
      // proceed to deletions
      contextualizersToDeleteIds.forEach(contextualizerId => {
        delete contextualizers[contextualizerId];
      });
      contextualizationsToDeleteIds.forEach(contextualizationId => {
        delete contextualizations[contextualizationId];
      });

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
            contextualizers,
            contextualizations,
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
      if (!state.story) {
        return state;
      }
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
          },
          lastUpdateAt: payload.lastUpdateAt,
        }
      };
    case DELETE_CONTEXTUALIZATION:
    case `${DELETE_CONTEXTUALIZATION}_BROADCAST`:
      contextualizations = {...state.story.contextualizations};
      delete contextualizations[payload.contextualizationId];
      return {
        ...state,
        story: {
          ...state.story,
          contextualizations,
          lastUpdateAt: payload.lastUpdateAt,
        }
      };

    /**
     * CONTEXTUALIZER RELATED
     */
    // contextualizers CUD
    case CREATE_CONTEXTUALIZER:
    case `${CREATE_CONTEXTUALIZER}_BROADCAST`:
    case UPDATE_CONTEXTUALIZER:
    case `${UPDATE_CONTEXTUALIZER}_BROADCAST`:
      if (!state.story) {
        return state;
      }
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
          },
          lastUpdateAt: payload.lastUpdateAt,
        }
      };
    case DELETE_CONTEXTUALIZER:
    case `${DELETE_CONTEXTUALIZER}_BROADCAST`:
      if (!state.story) {
        return state;
      }
      contextualizers = {...state.story.contextualizers};
      delete contextualizers[payload.contextualizerId];
      return {
        ...state,
        story: {
          ...state.story,
          contextualizers,
          lastUpdateAt: payload.lastUpdateAt,
        }
      };

    case SET_COVER_IMAGE:
    case `${SET_COVER_IMAGE}_BROADCAST`:
      if (!state.story) {
        return state;
      }
      const {resourceId} = payload;
      return {
        ...state,
        story: {
          ...state.story,
          metadata: {
            ...state.story.metadata,
            coverImage: {
              resourceId
            }
          },
          lastUpdateAt: payload.lastUpdateAt,
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
