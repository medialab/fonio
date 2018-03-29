/**
 * This module exports logic-related elements for configuring the settings of a story
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StorysManager
 */
import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';
import {csvParse} from 'd3-dsv';

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

import {uploadResourceServer, deleteResourceServer} from '../../helpers/serverExporter';

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
const SET_RESOURCES_TYPE_QUERY = '§Fonio/ResourcesManager/SET_RESOURCES_TYPE_QUERY';
const SET_RESOURCES_MODAL_STATE = '§Fonio/ResourcesManager/SET_RESOURCES_MODAL_STATE';

const REQUEST_DELETE_PROMPT = '§Fonio/ResourcesManager/REQUEST_DELETE_PROMPT';
const ABORT_DELETE_PROMPT = '§Fonio/ResourcesManager/ABORT_DELETE_PROMPT';
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

export const UPLOAD_RESOURCE_REMOTE = '§Fonio/ResourcesManager/UPLOAD_RESOURCE_REMOTE';
export const DELETE_RESOURCE_REMOTE = '§Fonio/ResourcesManager/DELETE_RESOURCE_REMOTE';


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
 * Sets the current query in the resources pannel
 * @param {string} query - the resource type to set
 * @return {object} action - the redux action to dispatch
 */
export const setResourcesTypeQuery = (query) => ({
  type: SET_RESOURCES_TYPE_QUERY,
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
  promise: () => {
    return new Promise((resolve, reject) => {
      switch (type) {
        // case csv file --> get file as text and parse it as csv
        // to produce a js array representation
        case 'csvFile':
          return getFileAsText(data, (err, str) => {
            try {
              const structuredData = csvParse(str);
              resolve({json: structuredData});
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
              return fileF;
            })
            .then(fileI => {
              file = fileI;
              return loadImage(fileI);
            })
            .then((base64) => {
              resolve({base64, file});
            })
            .catch(e => {
              reject(e);
            });
        // case video url (youtube or vimeo) --> retrieve
        // metadata from service api and save embed url
        case 'videoUrl':
          return videoUrlIsValid(data)
            .then(() => retrieveMediaMetadata(data, {youtubeAPIKey}))
            .then((info) => {
              return resolve(info);
            })
            .catch(e => reject(e));
        // case data presentation (bulgur-made)
        // --> get as text and convert to a json representation
        case 'dataPresentationFile':
          return getFileAsText(data, (err, str) => {
            try {
              const structuredData = JSON.parse(str);
              // todo: add a presentation validation hook here
              resolve({json: structuredData});
            }
            catch (e) {
              reject(e);
            }
          });
        // case html/embed code or webpage url --> use as is
        case 'webpageUrl':
        case 'htmlCode':
          return resolve(data);
        // case bib text file --> load file and convert it to csl-json
        
        case 'bibTeXFile':
          return getFileAsText(data, (err, str) => {
            const csl = parseBibTeXToCSLJSON(str);
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
export const startNewResourceConfiguration = (contextualizeAfterCreation = false, resourceType) => ({
  type: START_NEW_RESOURCE_CONFIGURATION,
  contextualizeAfterCreation,
  resourceType,
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
 * Launches the prompt for deleting a resource
 * @param {string} resourceId - the id of the resource prompted to delete
 * @return {object} action - the redux action to dispatch
 */
export const requestDeletePrompt = (resourceId) => ({
  type: REQUEST_DELETE_PROMPT,
  resourceId
});

/**
 * Dismisses resource delete prompt
 * @return {object} action - the redux action to dispatch
 */
export const abortDeletePrompt = () => ({
  type: ABORT_DELETE_PROMPT
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
 * upload resource to server
 * @param {string} storyId - the id of the story to create the resource in
 * @param {string} id - the id of the resource
 * @param {object} resource - the data of the resource to create
 * @return {object} action - the redux action to dispatch
 */
export const uploadResourceRemote = (storyId, id, resource, token) => ({
  type: UPLOAD_RESOURCE_REMOTE,
  storyId,
  id,
  resource,
  promise: () => {
    return uploadResourceServer(storyId, id, resource, token);
  }
});

/**
 * Deletes a resource in a given story
 * @param {string} storyId - the id of the story in which the resource to delete is
 * @param {string} id - id of the resource to delete
 * @return {object} action - the redux action to dispatch
 */
export const deleteResourceRemote = (storyId, resource, token) => ({
  type: DELETE_RESOURCE_REMOTE,
  id: resource.metadata.id,
  storyId,
  promise: () => {
    return deleteResourceServer(storyId, resource, token);
  }
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
  source: '',
  mime: ''
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
   * representation of the type query in resources pannel
   */
  resourcesTypeQuery: '',

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
   * status of the resource's data state
   */
  resourceUploadingState: undefined,

  /**
   * Whether resources are prompted for a selection (e.g. embedding a resource in an editor)
   */
  resourcesPrompted: false,

  /**
   * Current selection in an editor asking for an embed
   * @type ImmutableRecord
   */
  insertionSelection: undefined,

  /**
   * id of the resource asked for delete
   */
  resourcePromptedToDelete: undefined,
  /**
   * whether to directly contextualize after resource creation
   */
  contextualizeAfterResourceCreation: false
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
        resourcesPrompted: false,
        contextualizeAfterResourceCreation: false,
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
    // resource search query is changed
    case SET_RESOURCES_SEARCH_QUERY:
      return {
        ...state,
        resourcesSearchQuery: action.query
      };
    // resource type query is changed
    case SET_RESOURCES_TYPE_QUERY:
      return {
        ...state,
        resourcesTypeQuery: action.query
      };
    // resources modal is opened or closed
    case SET_RESOURCES_MODAL_STATE:
      return {
        ...state,
        resourcesModalState: action.state,
        resourceUploadingState: undefined,
        resourceDataLoadingState: undefined
      };
    // a new resource is asked
    case START_NEW_RESOURCE_CONFIGURATION:
      return {
        ...state,
        resourcesModalState: 'new',
        resourceCandidate: {
          metadata: {
            ...emptyResourceMetadata,
            type: action.resourceType
          }
        },
        resourceCandidateId: undefined,
        contextualizeAfterResourceCreation: action.contextualizeAfterCreation
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
        resourceCandidateId: undefined,
        contextualizeAfterResourceCreation: false
      };
    // section deletion is asked
    case REQUEST_DELETE_PROMPT:
      const {
        resourceId
      } = action;
      return {
        ...state,
        resourcePromptedToDelete: resourceId
      };
    // section deletion is dismissed
    case ABORT_DELETE_PROMPT:
      return {
        ...state,
        resourcePromptedToDelete: undefined
      };
    case UPLOAD_RESOURCE_REMOTE + '_PENDING':
      return {
        ...state,
        resourceUploadingState: 'pending',
      };
    case UPLOAD_RESOURCE_REMOTE + '_SUCCESS':
      return {
        ...state,
        resourcesModalState: 'closed',
        resourceUploadingState: 'success',
        resourceCandidateId: undefined
      };
    case UPLOAD_RESOURCE_REMOTE + '_FAIL':
      return {
        ...state,
        resourceUploadingState: 'fail'
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
    case SUBMIT_RESOURCE_DATA + '_PENDING':
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
      const metadata = {
        ...state.resourceCandidate.metadata,
        ...inferedMetadata,
        title: state.resourceCandidate.metadata.title ? state.resourceCandidate.metadata.title : inferedMetadata.title,
      };
      return {
        ...state,
        resourceDataLoadingState: 'success',
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
        resourceDataLoadingState: 'fail',
        resourceCandidate: {
          ...state.resourceCandidate,
          data: undefined
        }
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
export default combineReducers({
  resourcesUi
});

/*
 * Selectors
 */

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
const selectedResources = (state) => state.resourcesUi && state.resourcesUi.selectedResources;
const resourcesSearchQuery = (state) => state.resourcesUi && state.resourcesUi.resourcesSearchQuery;
const resourcesTypeQuery = (state) => state.resourcesUi && state.resourcesUi.resourcesTypeQuery;
const resourcesModalState = (state) => state.resourcesUi && state.resourcesUi.resourcesModalState;
const resourceCandidate = (state) => state.resourcesUi && state.resourcesUi.resourceCandidate;
const resourceCandidateId = (state) => state.resourcesUi && state.resourcesUi.resourceCandidateId;
const resourceDataLoadingState = (state) => state.resourcesUi && state.resourcesUi.resourceDataLoadingState;
const resourceUploadingState = (state) => state.resourcesUi && state.resourcesUi.resourceUploadingState;
const resourceCandidateType = (state) => state.resourcesUi
                                      && state.resourcesUi.resourceCandidate
                                      && state.resourcesUi.resourceCandidate.metadata
                                      && state.resourcesUi.resourceCandidate.metadata.type;
const resourcePromptedToDelete = (state) => state.resourcesUi.resourcePromptedToDelete;

const resourcesPrompted = (state) => state.resourcesUi.resourcesPrompted;
const insertionSelection = (state) => state.resourcesUi.insertionSelection;
const contextualizeAfterResourceCreation = state => state.resourcesUi.contextualizeAfterResourceCreation;

export const selector = createStructuredSelector({
  selectedResources,
  resourcesSearchQuery,
  resourcesTypeQuery,
  resourcesModalState,
  resourceCandidate,
  resourceCandidateId,
  resourceCandidateType,
  resourceDataLoadingState,
  resourceUploadingState,
  resourcesPrompted,
  insertionSelection,
  resourcePromptedToDelete,
  contextualizeAfterResourceCreation,
});

