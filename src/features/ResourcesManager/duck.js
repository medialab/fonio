/**
 * This module exports logic-related elements for configuring the settings of a story
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StorysManager
 */
import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';
import {persistentReducer} from 'redux-pouchdb';
import {csvParse} from 'd3-dsv';

import config from '../../../config';
const {timers} = config;

import {
  fileIsAnImage,
  inferMetadata,
  retrieveMediaMetadata,
  parseBibTeXToCSLJSON,
  videoUrlIsValid,
  loadImage
} from '../../helpers/assetsUtils';

import {
  getFileAsText
} from '../../helpers/fileLoader';

import {
  youtubeAPIKey
} from '../../../secrets';

/*
 * Action names
 */
import {
  RESET_APP,
  SET_ACTIVE_STORY,
} from '../GlobalUi/duck';
import {
  PROMPT_ASSET_EMBED,
  UNPROMPT_ASSET_EMBED,
  EMBED_ASSET
} from '../StoryEditor/duck';

/*
 * UI-RELATED
 */
const SELECT_RESOURCE = '§Fonio/ResourcesManager/SELECT_RESOURCE';
const DESELECT_RESOURCE = '§Fonio/ResourcesManager/DESELECT_RESOURCE';
const SET_SELECTED_RESOURCES = '§Fonio/ResourcesManager/SET_SELECTED_RESOURCES';
const SET_RESOURCES_SEARCH_QUERY = '§Fonio/ResourcesManager/SET_RESOURCES_SEARCH_QUERY';
const SET_RESOURCES_MODAL_STATE = '§Fonio/ResourcesManager/SET_RESOURCES_MODAL_STATE';
/*
 * CANDIDATE-RELATED
 */
const SET_RESOURCE_CANDIDATE_TYPE = '§Fonio/ResourcesManager/SET_RESOURCE_CANDIDATE_TYPE';
const SET_RESOURCE_CANDIDATE_METADATA_VALUE = '§Fonio/ResourcesManager/SET_RESOURCE_CANDIDATE_METADATA_VALUE';
const START_NEW_RESOURCE_CONFIGURATION = '§Fonio/ResourcesManager/START_NEW_RESOURCE_CONFIGURATION';
const START_EXISTING_RESOURCE_CONFIGURATION = '§Fonio/ResourcesManager/START_EXISTING_RESOURCE_CONFIGURATION';
const SUBMIT_RESOURCE_DATA = '§Fonio/ResourcesManager/SUBMIT_RESOURCE_DATA';
/*
 * CONTENT-RELATED
 */
export const CREATE_RESOURCE = '§Fonio/ResourcesManager/CREATE_RESOURCE';
export const DELETE_RESOURCE = '§Fonio/ResourcesManager/DELETE_RESOURCE';
export const UPDATE_RESOURCE = '§Fonio/ResourcesManager/UPDATE_RESOURCE';


export const embedAsset = (storyId, contentId, resourceId) => ({
  type: EMBED_ASSET,
  storyId,
  contentId,
  resourceId,
});

export const selectResource = (id) => ({
  type: SELECT_RESOURCE,
  id
});
export const deselectResource = (id) => ({
  type: DESELECT_RESOURCE,
  id
});
export const setSelectedResources = (ids = []) => ({
  type: SET_SELECTED_RESOURCES,
  ids
});
export const setResourcesSearchQuery = (query) => ({
  type: SET_RESOURCES_SEARCH_QUERY,
  query
});
export const setResourceCandidateMetadataValue = (key, value) => ({
  type: SET_RESOURCE_CANDIDATE_METADATA_VALUE,
  key,
  value
});

export const submitResourceData = (type, data, existingData) => ({
  type: SUBMIT_RESOURCE_DATA,
  promise: (dispatch) => {
    return new Promise((resolve, reject) => {
      switch (type) {
        case 'csvFile':
          return getFileAsText(data, (err, str) => {
            setTimeout(() => {
              dispatch({
                type: SUBMIT_RESOURCE_DATA + '_RESET'
                });
              }, timers.veryLong);
            try {
              const structuredData = csvParse(str);
              resolve(structuredData);
            }
            catch (e) {
              reject(e);
            }
          });
        case 'imageFile':
          let file;
          return fileIsAnImage(data)
            .then(fileF => {
              setTimeout(() => {
                dispatch({
                  type: SUBMIT_RESOURCE_DATA + '_RESET'
                });
              }, timers.veryLong);
              return fileF;
            })
            .then(fileI => {
              file = fileI;
              return loadImage(fileI);
            })
            .then((base64) => {
              setTimeout(() => {
                dispatch({
                  type: SUBMIT_RESOURCE_DATA + '_RESET'
                });
              }, timers.veryLong);
              resolve({base64, file});
            })
            .catch(e => {
              reject(e);
              setTimeout(() => {
                dispatch({
                  type: SUBMIT_RESOURCE_DATA + '_RESET'
                });
              }, timers.veryLong);
            });
        case 'videoUrl':
          return videoUrlIsValid(data)
            .then(() => retrieveMediaMetadata(data, {youtubeAPIKey}))
            .then((info) => {
              setTimeout(() => {
              dispatch({
                type: SUBMIT_RESOURCE_DATA + '_RESET'
                });
              }, timers.veryLong);
              return resolve(info);
            })
            .catch(e => reject(e));
        case 'dataPresentationFile':
          return getFileAsText(data, (err, str) => {
            setTimeout(() => {
              dispatch({
                type: SUBMIT_RESOURCE_DATA + '_RESET'
                });
              }, timers.veryLong);
            try {
              const structuredData = JSON.parse(str);
              resolve(structuredData);
            }
        catch (e) {
              reject(e);
            }
          });
        case 'htmlCode':
          return resolve(data);
        case 'bibTeXFile':
          return getFileAsText(data, (err, str) => {
            const csl = parseBibTeXToCSLJSON(str);
            setTimeout(() => {
              dispatch({
                type: SUBMIT_RESOURCE_DATA + '_RESET'
                });
              }, timers.veryLong);
            resolve(csl);
          });
        case 'cslJSON':
          return resolve(data);
        case 'glossaryName':
          return resolve({...existingData, name: data});
        case 'glossaryType':
          return resolve({...existingData, glossaryType: data});
        default:
          reject('unkown input type');
      }
    });
  }
});
/**
 * @param {string} state - the new state - in ['closed', 'new', 'edit']
 */
export const setResourcesModalState = (state) => ({
  type: SET_RESOURCES_MODAL_STATE,
  state
});
export const startNewResourceConfiguration = () => ({
  type: START_NEW_RESOURCE_CONFIGURATION
});
export const startExistingResourceConfiguration = (resourceId, resource) => ({
  type: START_EXISTING_RESOURCE_CONFIGURATION,
  resourceId,
  resource
});
export const setResourceCandidateType = (resourceType) => ({
  type: SET_RESOURCE_CANDIDATE_TYPE,
  resourceType
});

export const createResource = (storyId, id, resource) => ({
  type: CREATE_RESOURCE,
  storyId,
  id,
  resource
});
export const deleteResource = (storyId, id) => ({
  type: DELETE_RESOURCE,
  storyId,
  id
});
export const updateResource = (storyId, id, resource) => ({
  type: UPDATE_RESOURCE,
  storyId,
  id,
  resource
});

/*
 * Reducers
 */

const emptyResourceMetadata = {
  type: undefined,
  title: '',
  description: '',
  source: ''
};

const RESOURCES_UI_DEFAULT_STATE = {
  selectedResources: [],
  resourcesSearchQuery: '',
  resourcesModalState: 'closed',
  resourceCandidate: {
    metadata: {}
  },
  resourceCandidateId: undefined,
  resourceDataLoadingState: undefined,
  resourcesPrompted: false,
  // it is necessary to store the current selection in the editor
  insertionSelection: undefined
};
/**
 * This redux reducer handles the modification of the ui state of resources management
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 */
function resourcesUi (state = RESOURCES_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    case RESET_APP:
    case SET_ACTIVE_STORY:
      return RESOURCES_UI_DEFAULT_STATE;

    case PROMPT_ASSET_EMBED:
      return {
        ...state,
        resourcesPrompted: true,
        insertionSelection: action.selection
      };
    case UNPROMPT_ASSET_EMBED:
    case EMBED_ASSET:
      return {
        ...state,
        resourcesPrompted: false
      };

    case SELECT_RESOURCE:
      return {
        ...state,
        selectedResources: [...state.selectedResources, action.id]
      };
    case DESELECT_RESOURCE:
      const index = state.selectedResources.indexOf(action.id);
      return {
        ...state,
        selectedResources: [
          ...state.selectedResources.slice(0, index - 1),
          ...state.selectedResources.slice(index)
        ]
      };
    case SET_SELECTED_RESOURCES:
      return {
        ...state,
        selectedResources: [...action.ids]
      };
    case SET_RESOURCES_SEARCH_QUERY:
      return {
        ...state,
        resourcesSearchQuery: action.query
      };
    case SET_RESOURCES_MODAL_STATE:
      return {
        ...state,
        resourcesModalState: action.state
      };
    case START_NEW_RESOURCE_CONFIGURATION:
      return {
        ...state,
        resourcesModalState: 'new',
        resourceCandidate: {
          metadata: emptyResourceMetadata
        },
        resourceCandidateId: undefined
      };
    case START_EXISTING_RESOURCE_CONFIGURATION:
      return {
        ...state,
        resourcesModalState: 'existing',
        resourceCandidateId: action.resourceId,
        resourceCandidate: {
          ...action.resource
        }
      };
    case SET_RESOURCE_CANDIDATE_TYPE:
      return {
        ...state,
        resourceCandidate: {
          ...state.resourceCandidate,
          metadata: {
            ...state.resourceCandidate.metadata,
            type: action.resourceType
          },
          data: undefined
        }
      };
    case CREATE_RESOURCE:
    case UPDATE_RESOURCE:
    case DELETE_RESOURCE:
      return {
        ...state,
        resourcesModalState: 'closed',
        resourceCandidateId: undefined
      };
    case SET_RESOURCE_CANDIDATE_METADATA_VALUE:
      return {
        ...state,
        resourceCandidate: {
          ...state.resourceCandidate,
          metadata: {
            ...state.resourceCandidate.metadata,
            [action.key]: action.value
          }
        }
      };
    case SUBMIT_RESOURCE_DATA:
      return {
        ...state,
        resourceDataLoadingState: 'processing'
      };
    case SUBMIT_RESOURCE_DATA + '_SUCCESS':
      const inferedMetadata = inferMetadata(action.result, state.resourceCandidate.metadata.type);
      const metadata = Object.keys(inferedMetadata).reduce((result, key) => {
        if (inferedMetadata[key] && (!result[key] || !result[key].length)) {
          result[key] = inferedMetadata[key];
        }
        return result;
      }, state.resourceCandidate.metadata);
      return {
        ...state,
        resourceDataLoadingState: undefined,
        resourceCandidate: {
          ...state.resourceCandidate,
          metadata,
          data: action.result
        }
      };
    case SUBMIT_RESOURCE_DATA + '_FAIL':
      return {
        ...state,
        resourceDataLoadingState: 'fail'
      };
    case SUBMIT_RESOURCE_DATA + '_RESET':
      return {
        ...state,
        resourceDataLoadingState: undefined
      };
    default:
      return state;
  }
}
/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default persistentReducer(combineReducers({
  resourcesUi
}), 'fonio-resources');

/*
 * Selectors
 */
/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
const selectedResources = (state) => state.resourcesUi && state.resourcesUi.selectedResources;
const resourcesSearchQuery = (state) => state.resourcesUi && state.resourcesUi.resourcesSearchQuery;
const resourcesModalState = (state) => state.resourcesUi && state.resourcesUi.resourcesModalState;
const resourceCandidate = (state) => state.resourcesUi && state.resourcesUi.resourceCandidate;
const resourceCandidateId = (state) => state.resourcesUi && state.resourcesUi.resourceCandidateId;
const resourceDataLoadingState = (state) => state.resourcesUi && state.resourcesUi.resourceDataLoadingState;
const resourceCandidateType = (state) => state.resourcesUi
                                      && state.resourcesUi.resourceCandidate
                                      && state.resourcesUi.resourceCandidate.metadata
                                      && state.resourcesUi.resourceCandidate.metadata.type;

const resourcesPrompted = (state) => state.resourcesUi.resourcesPrompted;
const insertionSelection = (state) => state.resourcesUi.insertionSelection;

export const selector = createStructuredSelector({
  selectedResources,
  resourcesSearchQuery,
  resourcesModalState,
  resourceCandidate,
  resourceCandidateId,
  resourceCandidateType,
  resourceDataLoadingState,
  resourcesPrompted,
  insertionSelection
});

