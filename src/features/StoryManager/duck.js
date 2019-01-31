/**
 * This module exports logic-related elements for handling edited story state
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StoryManager
 */

import { combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';

import { get, post, put, delete as del } from 'axios';
import Ajv from 'ajv';

import storySchema from 'quinoa-schemas/story';
import resourceSchema from 'quinoa-schemas/resource';

import { LEAVE_STORY } from '../ConnectionsManager/duck';

import config from '../../config';

import { updateEditionHistoryMap, loadStoryToken } from '../../helpers/localStorageUtils';

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
export const SAVE_STORY = 'SAVE_STORY';

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
export const activateStory = ( payload ) => ( {
  type: ACTIVATE_STORY,
  payload,
  promise: () => {
    const { storyId, userId, token } = payload;
    const serverRequestUrl = `${config.restUrl}/stories/${storyId}?userId=${userId}&edit=true`;
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    return get( serverRequestUrl, options );
  },
} );

/**
 * Template for all story change related actions
 */
export const updateStory = ( TYPE, payload, callback ) => {
  updateEditionHistoryMap( payload.storyId );
  let blockType;
  let blockId;

  // TODO: refactor validation schema more modular
  let payloadSchema = DEFAULT_PAYLOAD_SCHEMA;
  const sectionSchema = storySchema.properties.sections.patternProperties['[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'];

  switch ( TYPE ) {
    case UPDATE_STORY_METADATA:
      blockType = 'storyMetadata';
      blockId = 'storyMetadata';
      payloadSchema = {
        ...DEFAULT_PAYLOAD_SCHEMA,
        properties: {
          ...DEFAULT_PAYLOAD_SCHEMA.properties,
          metadata: storySchema.properties.metadata,
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
          level: storySchema
                  .properties
                  .sections
                  .patternProperties['[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}']
                  .properties
                  .metadata
                  .properties
                  .level,
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
            const val = ajv.compile( payloadSchema );
            return val( payload );
          },
          msg: () => {
            const val = ajv.compile( payloadSchema );
            return val.errors;
          },
        },
      },
    },
  };
};

/**
 * Action creators related to socket-based edited story data edition
 */
export const updateStoryMetadata = ( payload, callback ) => updateStory( UPDATE_STORY_METADATA, payload, callback );
export const updateStorySettings = ( payload, callback ) => updateStory( UPDATE_STORY_SETTINGS, payload, callback );
export const updateSectionsOrder = ( payload, callback ) => updateStory( UPDATE_SECTIONS_ORDER, payload, callback );

export const createSection = ( payload, callback ) => updateStory( CREATE_SECTION, payload, callback );
export const updateSection = ( payload, callback ) => updateStory( UPDATE_SECTION, payload, callback );
export const deleteSection = ( payload, callback ) => updateStory( DELETE_SECTION, payload, callback );
export const setSectionLevel = ( payload, callback ) => updateStory( SET_SECTION_LEVEL, payload, callback );

export const createResource = ( payload, callback ) => updateStory( CREATE_RESOURCE, payload, callback );
export const updateResource = ( payload, callback ) => updateStory( UPDATE_RESOURCE, payload, callback );
export const deleteResource = ( payload, callback ) => updateStory( DELETE_RESOURCE, payload, callback );

export const createContextualizer = ( payload, callback ) => updateStory( CREATE_CONTEXTUALIZER, payload, callback );
export const updateContextualizer = ( payload, callback ) => updateStory( UPDATE_CONTEXTUALIZER, payload, callback );
export const deleteContextualizer = ( payload, callback ) => updateStory( DELETE_CONTEXTUALIZER, payload, callback );

export const createContextualization = ( payload, callback ) => updateStory( CREATE_CONTEXTUALIZATION, payload, callback );
export const updateContextualization = ( payload, callback ) => updateStory( UPDATE_CONTEXTUALIZATION, payload, callback );
export const deleteContextualization = ( payload, callback ) => updateStory( DELETE_CONTEXTUALIZATION, payload, callback );

export const setCoverImage = ( payload ) => updateStory( SET_COVER_IMAGE, payload );

/**
 * Action creators related to resource upload request
 */
export const uploadResource = ( payload, mode, callback ) => ( {
  type: UPLOAD_RESOURCE,
  payload: {
    ...payload,
    lastUpdateAt: new Date().getTime()
  },
  promise: () => {
    const token = loadStoryToken( payload.storyId );
    const lastUpdateAt = new Date().getTime();
    const options = {
      headers: {
        'x-access-token': token,
      },
    };

    let serverRequestUrl;
    if ( mode === 'create' ) {
      serverRequestUrl = `${config.restUrl}/resources/${payload.storyId}?userId=${payload.userId}&lastUpdateAt=${lastUpdateAt}`;
      return new Promise( ( resolve, reject ) => {
        post( serverRequestUrl, payload.resource, options )
              .then( ( data ) => {
                if ( typeof callback === 'function' ) {
                  callback( null );
                }
                resolve( data );
              } )
              .catch( ( err ) => {
                if ( typeof callback === 'function' ) {
                  callback( err );
                }
                reject( err );
              } );
      } );
    }
    serverRequestUrl = `${config.restUrl}/resources/${payload.storyId}/${payload.resourceId}?userId=${payload.userId}&lastUpdateAt=${lastUpdateAt}`;
    return new Promise( ( resolve, reject ) => {
      put( serverRequestUrl, payload.resource, options )
        .then( ( data ) => {
          if ( typeof callback === 'function' ) {
            callback( null );
          }
          resolve( data );
        } )
        .catch( ( err ) => {
          if ( typeof callback === 'function' ) {
            callback( err );
          }
          reject( err );
        } );
    } );

  },
} );

export const deleteUploadedResource = ( payload, callback ) => ( {
  type: DELETE_UPLOADED_RESOURCE,
  payload,
  promise: () => {
    const token = loadStoryToken( payload.storyId );
    const lastUpdateAt = new Date().getTime();
    const options = {
      headers: {
        'x-access-token': token,
      },
    };
    const serverRequestUrl = `${config.restUrl}/resources/${payload.storyId}/${payload.resourceId}?userId=${payload.userId}&lastUpdateAt=${lastUpdateAt}`;
    return del( serverRequestUrl, options )
            .then( ( thatPayload ) => {
              if ( typeof callback === 'function' ) {
                callback( null, thatPayload );
              }
            } )
            .catch( ( error ) => {
              if ( typeof callback === 'function' ) {
                callback( error );
              }
            } );
  },
} );

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
export default function story( state = STORY_DEFAULT_STATE, action ) {
  const { result, payload } = action;
  let contextualizations;
  let contextualizers;
  let contextualizersToDeleteIds;
  let contextualizationsToDeleteIds;
  let newSectionsOrder;
  switch ( action.type ) {
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
      if ( !state.story ) {
        return state;
      }
      return {
          ...state,
          story: {
            ...state.story,
            metadata: { ...payload.metadata },
            lastUpdateAt: payload.lastUpdateAt,
          }
      };

    /**
     * STORY SETTINGS
     */
    case `${UPDATE_STORY_SETTINGS}_SUCCESS`:
    case `${UPDATE_STORY_SETTINGS}_BROADCAST`:
      if ( !state.story ) {
        return state;
      }
      return {
          ...state,
          story: {
            ...state.story,
            settings: { ...payload.settings },
            lastUpdateAt: payload.lastUpdateAt,
          }
      };

    /**
     * SECTIONS ORDER
     */
    case `${UPDATE_SECTIONS_ORDER}`:
    case `${UPDATE_SECTIONS_ORDER}_BROADCAST`:
      if ( !state.story ) {
        return state;
      }
      const oldSectionsOrder = [ ...state.story.sectionsOrder ];
      newSectionsOrder = [ ...payload.sectionsOrder ];
      let resolvedSectionsOrder = [ ...payload.sectionsOrder ];

      /*
       * new order is bigger than older order
       * (probably because a user deleted a section in the meantime)
       * --> we filter the new order with only existing sections
       */
      if ( newSectionsOrder.length > oldSectionsOrder.length ) {
          resolvedSectionsOrder = newSectionsOrder.filter(
            ( newSectionId ) => oldSectionsOrder.includes( newSectionId )
          );

      /*
       * new order is smaller than older order
       * (probably because a user created a section in the meantime)
       * --> we add created sections to the new sections order
       */
      }
      else if ( newSectionsOrder.length < oldSectionsOrder.length ) {
        resolvedSectionsOrder = [
          ...newSectionsOrder,
          ...oldSectionsOrder.slice( newSectionsOrder.length )
        ];
      }
      return {
          ...state,
          story: {
            ...state.story,
            sectionsOrder: [ ...resolvedSectionsOrder ],
            lastUpdateAt: payload.lastUpdateAt,
          }
      };

    /**
     * SECTION CRUD
     */
    case `${CREATE_SECTION}`:
    case `${CREATE_SECTION}_BROADCAST`:
      if ( !state.story ) {
        return state;
      }
      const sectionIndex = payload.sectionIndex || state.story.sectionsOrder.length - 1;
      newSectionsOrder = sectionIndex < state.story.sectionsOrder.length ?
            [
              ...state.story.sectionsOrder.slice( 0, sectionIndex ),
              payload.sectionId,
              ...state.story.sectionsOrder.slice( sectionIndex )
            ]
            :
            [
              ...state.story.sectionsOrder,
              payload.sectionId
            ];
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
            sectionsOrder: newSectionsOrder,
            lastUpdateAt: payload.lastUpdateAt,
          }
      };
    case `${UPDATE_SECTION}_SUCCESS`:
    case `${UPDATE_SECTION}_BROADCAST`:
      if ( !state.story ) {
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
      if ( !state.story ) {
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
      if ( !state.story ) {
        return state;
      }
      contextualizations = { ...state.story.contextualizations };
      contextualizers = { ...state.story.contextualizers };

      contextualizationsToDeleteIds = Object.keys( contextualizations )
      .filter( ( id ) => {
        return contextualizations[id].sectionId === payload.sectionId;
      } );
      contextualizersToDeleteIds = [];

      contextualizationsToDeleteIds
      .forEach( ( id ) => {
        contextualizersToDeleteIds.push( contextualizations[id].contextualizerId );
      } );

      contextualizersToDeleteIds.forEach( ( contextualizerId ) => {
        delete contextualizers[contextualizerId];
      } );
      contextualizationsToDeleteIds.forEach( ( contextualizationId ) => {
        delete contextualizations[contextualizationId];
      } );
      return {
          ...state,
          story: {
            ...state.story,
            sections: Object.keys( state.story.sections )
              .reduce( ( thatResult, thatSectionId ) => {
                if ( thatSectionId === payload.sectionId ) {
                  return thatResult;
                }
                else return {
                  ...thatResult,
                  [thatSectionId]: state.story.sections[thatSectionId]
                };
              }, {} ),
            contextualizations,
            contextualizers,
            sectionsOrder: state.story.sectionsOrder.filter( ( id ) => id !== payload.sectionId ),
            lastUpdateAt: payload.lastUpdateAt,
          }

      };

    /**
     * STORY RESOURCES
     */
    case `${CREATE_RESOURCE}`:
    case `${CREATE_RESOURCE}_BROADCAST`:
      if ( !state.story ) {
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
                createdAt: payload.lastUpdateAt
              }
            },
            lastUpdateAt: payload.lastUpdateAt,
          }
      };
    case `${UPDATE_RESOURCE}`:
    case `${UPDATE_RESOURCE}_BROADCAST`:
      if ( !state.story ) {
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
              }
            },
            lastUpdateAt: payload.lastUpdateAt,
          }
      };
    case `${UPLOAD_RESOURCE}_SUCCESS`:
      if ( !state.story ) {
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
      if ( !state.story ) {
        return state;
      }
      contextualizations = { ...state.story.contextualizations };
      contextualizers = { ...state.story.contextualizers };

      /*
       * for now as the app does not allow to reuse the same contextualizer for several resources
       * we will delete associated contextualizers as well as associated contextualizations
       * (forseeing long edition sessions in which user create and delete a large number of contextualizations
       * if not doing so we would end up with a bunch of unused contextualizers in documents' data after a while)
       */

      // we will store contextualizers id to delete here
      contextualizersToDeleteIds = [];

      // we will store contextualizations id to delete here
      contextualizationsToDeleteIds = [];
      // spot all objects to delete
      Object.keys( contextualizations )
        .forEach( ( contextualizationId ) => {
          if ( contextualizations[contextualizationId].resourceId === payload.resourceId ) {
            contextualizationsToDeleteIds.push( contextualizationId );
            contextualizersToDeleteIds.push( contextualizations[contextualizationId].contextualizerId );
          }
        } );
      // proceed to deletions
      contextualizersToDeleteIds.forEach( ( contextualizerId ) => {
        delete contextualizers[contextualizerId];
      } );
      contextualizationsToDeleteIds.forEach( ( contextualizationId ) => {
        delete contextualizations[contextualizationId];
      } );

      return {
          ...state,
          story: {
            ...state.story,
            resources: Object.keys( state.story.resources )
              .reduce( ( thatResult, thatResourceId ) => {
                if ( thatResourceId === payload.resourceId ) {
                  return thatResult;
                }
                else return {
                  ...thatResult,
                  [thatResourceId]: state.story.resources[thatResourceId]
                };
              }, {} ),
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
      if ( !state.story ) {
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
      contextualizations = { ...state.story.contextualizations };
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
      if ( !state.story ) {
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
      if ( !state.story ) {
        return state;
      }
      contextualizers = { ...state.story.contextualizers };
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
      if ( !state.story ) {
        return state;
      }
      const { resourceId } = payload;
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

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */

const editedStory = ( state ) => state.story;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector( {
  editedStory
} );
