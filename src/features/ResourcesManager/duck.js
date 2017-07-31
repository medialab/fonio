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


/**
 * Embeds an asset in the main or note content of a specific section in a specific story
 * @param {string} storyId - the id of the story to embed an asset in
 * @param {string} contentId - the content to embed it in ('main' or noteId)
 * @param {string} resourceId - the resource id to embed
 * @return {object} action - the redux action to dispatch
 */
export const embedAsset = (storyId, contentId, resourceId) => ({
  type: EMBED_ASSET,
  storyId,
  contentId,
  resourceId,
});

/**
 * Selects a resource in the resource pannel
 * @param {string} id - the resource to select
 * @return {object} action - the redux action to dispatch
 */
export const selectResource = (id) => ({
  type: SELECT_RESOURCE,
  id
});

/**
 * Deselects a resource in the resource pannel
 * @param {string} id - the resource to deselect
 * @return {object} action - the redux action to dispatch
 */
export const deselectResource = (id) => ({
  type: DESELECT_RESOURCE,
  id
});

/**
 * Sets selected resources in the resources pannel
 * @param {array<string>} ids - the resources to select
 * @return {object} action - the redux action to dispatch
 */
export const setSelectedResources = (ids = []) => ({
  type: SET_SELECTED_RESOURCES,
  ids
});

/**
 * Sets the current query in the resources pannel
 * @param {string} query - the resource search query to set
 * @return {object} action - the redux action to dispatch
 */
export const setResourcesSearchQuery = (query) => ({
  type: SET_RESOURCES_SEARCH_QUERY,
  query
});

/**
 * Updates or create a metadata prop for the resource candidate
 * @param {string} key - the key of the metadata
 * @param {string} value - the value of the metadata
 * @return {object} action - the redux action to dispatch
 */
export const setResourceCandidateMetadataValue = (key, value) => ({
  type: SET_RESOURCE_CANDIDATE_METADATA_VALUE,
  key,
  value
});


/**
 * Submits the data to use to represent a resource
 * @param {string} type - type of method to use to fetch the data
 * @param {object|string} data - input parameter used to fetch the data
 * @param {object} existingData - data to merge the new data with
 * @return {object} action - the redux action to dispatch
 */
export const submitResourceData = (type, data, existingData) => ({
  type: SUBMIT_RESOURCE_DATA,
  promise: (dispatch) => {
    return new Promise((resolve, reject) => {
      switch (type) {
        // case csv file --> get file as text and parse it as csv
        // to produce a js array representation
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
        // case image file --> load it as base64 data
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
        // case video url (youtube or vimeo) --> retrieve
        // metadata from service api and save embed url
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
        // case data presentation (bulgur-made)
        // --> get as text and convert to a json representation
        case 'dataPresentationFile':
          return getFileAsText(data, (err, str) => {
            setTimeout(() => {
              dispatch({
                type: SUBMIT_RESOURCE_DATA + '_RESET'
                });
              }, timers.veryLong);
            try {
              const structuredData = JSON.parse(str);
              // todo: add a presentation validation hook here
              resolve(structuredData);
            }
            catch (e) {
              reject(e);
            }
          });
        // case html/embed code --> use as is
        case 'htmlCode':
          return resolve(data);
        // case bib text file --> load file and convert it to csl-json
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
        // case csl-json --> use as is
        case 'cslJSON':
          return resolve(data);
        // todo: glossary case is a bit messy
        // case glossary entry name --> use as is
        case 'glossaryName':
          return resolve({...existingData, name: data});
        // case glossary type --> use as is
        case 'glossaryType':
          return resolve({...existingData, glossaryType: data});
        default:
          reject('unkown input type');
      }
    });
  }
});

/**
 * Sets the state of the resource modal
 * @param {string} state - the new state - in ['closed', 'new', 'edit']
 * @return {object} action - the redux action to dispatch
 */
export const setResourcesModalState = (state) => ({
  type: SET_RESOURCES_MODAL_STATE,
  state
});

/**
 * Starts a new resource candidate configuration
 * @return {object} action - the redux action to dispatch
 */
export const startNewResourceConfiguration = () => ({
  type: START_NEW_RESOURCE_CONFIGURATION
});

/**
 * Starts an existing resource configuration
 * @param {string} resourceId - the id of the resource to configure
 * @param {object} resource - the existing resource data
 * @return {object} action - the redux action to dispatch
 */
export const startExistingResourceConfiguration = (resourceId, resource) => ({
  type: START_EXISTING_RESOURCE_CONFIGURATION,
  resourceId,
  resource
});

/**
 * Sets the type of the resource being configured
 * @param {string} resourceType - the type of the resource (e.g. 'bib')
 * @return {object} action - the redux action to dispatch
 */
export const setResourceCandidateType = (resourceType) => ({
  type: SET_RESOURCE_CANDIDATE_TYPE,
  resourceType
});

/**
 * Creates a new resource
 * @param {string} storyId - the id of the story to create the resource in
 * @param {string} id - the id of the resource
 * @param {object} resource - the data of the resource to create
 * @return {object} action - the redux action to dispatch
 */
export const createResource = (storyId, id, resource) => ({
  type: CREATE_RESOURCE,
  storyId,
  id,
  resource
});

/**
 * Deletes a resource in a given story
 * @param {string} storyId - the id of the story in which the resource to delete is
 * @param {string} id - id of the resource to delete
 * @return {object} action - the redux action to dispatch
 */
export const deleteResource = (storyId, id) => ({
  type: DELETE_RESOURCE,
  storyId,
  id
});

/**
 * Updates an existing resource
 * @param {string} storyId - the id of the story in which the resource is
 * @param {string} id - the id of the resource
 * @param {object} resource - new data of the resource
 * @return {object} action - the redux action to dispatch
 */
export const updateResource = (storyId, id, resource) => ({
  type: UPDATE_RESOURCE,
  storyId,
  id,
  resource
});

/*
 * Reducers
 */


/**
 * Data model for a new resource
 */
// todo: refactor that as a createEmptyResource() resource util ?
const emptyResourceMetadata = {
  type: undefined,
  title: '',
  description: '',
  source: ''
};


/**
 * default states of the resources pannel ui
 */
const RESOURCES_UI_DEFAULT_STATE = {

  /**
   * Resources being used (not handled for now in the ui
   * but could be used for batch operations such as batch delete)
   */
  selectedResources: [],

  /**
   * representation of the search query in resources pannel
   */
  resourcesSearchQuery: '',

  /**
   * whether a resource configuration is opened and
   * its state (possible values: ['closed', 'new', 'existing'])
   */
  resourcesModalState: 'closed',

  /**
   * representation of the temporary resource being configured
   */
  resourceCandidate: {
    metadata: {}
  },

  /**
   * id of the resource being configured
   */
  resourceCandidateId: undefined,

  /**
   * status of the resource's data state
   */
  resourceDataLoadingState: undefined,

  /**
   * Whether resources are prompted for a selection (e.g. embedding a resource in an editor)
   */
  resourcesPrompted: false,

  /**
   * Current selection in an editor asking for an embed
   * @type ImmutableRecord
   */
  insertionSelection: undefined
};

/**
 * This redux reducer handles the modification of the ui state of resources management
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the new state
 */
function resourcesUi (state = RESOURCES_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    // cases ui state is reset
    case RESET_APP:
    case SET_ACTIVE_STORY:
      return RESOURCES_UI_DEFAULT_STATE;
    // case a resource selection is prompted
    case PROMPT_ASSET_EMBED:
      return {
        ...state,
        resourcesPrompted: true,
        insertionSelection: action.selection
      };
    // cases resources are no longer subjected to a selection
    case UNPROMPT_ASSET_EMBED:
    case EMBED_ASSET:
      return {
        ...state,
        resourcesPrompted: false
      };
    // a resource is selected
    case SELECT_RESOURCE:
      return {
        ...state,
        selectedResources: [...state.selectedResources, action.id]
      };
    // a resource is deselected
    case DESELECT_RESOURCE:
      const index = state.selectedResources.indexOf(action.id);
      return {
        ...state,
        selectedResources: [
          ...state.selectedResources.slice(0, index - 1),
          ...state.selectedResources.slice(index)
        ]
      };
    // several resources are selected
    case SET_SELECTED_RESOURCES:
      return {
        ...state,
        selectedResources: [...action.ids]
      };
    // search query is changed
    case SET_RESOURCES_SEARCH_QUERY:
      return {
        ...state,
        resourcesSearchQuery: action.query
      };
    // resources modal is opened or closed
    case SET_RESOURCES_MODAL_STATE:
      return {
        ...state,
        resourcesModalState: action.state
      };
    // a new resource is asked
    case START_NEW_RESOURCE_CONFIGURATION:
      return {
        ...state,
        resourcesModalState: 'new',
        resourceCandidate: {
          metadata: emptyResourceMetadata
        },
        resourceCandidateId: undefined
      };
    // configuration of an existing resource is asked
    case START_EXISTING_RESOURCE_CONFIGURATION:
      return {
        ...state,
        resourcesModalState: 'existing',
        resourceCandidateId: action.resourceId,
        resourceCandidate: {
          ...action.resource
        }
      };
    // the type of a resource candidate is set
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
    // CUD on resources
    case CREATE_RESOURCE:
    case UPDATE_RESOURCE:
    case DELETE_RESOURCE:
      return {
        ...state,
        resourcesModalState: 'closed',
        resourceCandidateId: undefined
      };
    // a metadata property of the resource candidate is changed
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
    // new data is submitted for the resource candidate
    case SUBMIT_RESOURCE_DATA:
      return {
        ...state,
        resourceDataLoadingState: 'processing'
      };
    // new data was successfully loaded
    case SUBMIT_RESOURCE_DATA + '_SUCCESS':
      // we try to infer some metadata props from the data.
      // this is useful for resources types such as bibliographic records
      // in which data contains probable metadata (e.g. 'title')
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
    // new data loading failed
    case SUBMIT_RESOURCE_DATA + '_FAIL':
      return {
        ...state,
        resourceDataLoadingState: 'fail'
      };
    // resetting the ui state after new data was submitted
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

