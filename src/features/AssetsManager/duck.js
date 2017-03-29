/**
 * This module exports logic-related elements for configuring the settings of a story
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StorysManager
 */
import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';
import {persistentReducer} from 'redux-pouchdb';

import {
  fileIsAnImage,
  videoUrlIsValid,
  loadImage
} from '../../helpers/assetsUtils';

import {
  getFileAsText
} from '../../helpers/fileLoader';

/*
 * Action names
 */
import {
  RESET_APP,
  SET_ACTIVE_STORY
} from '../Editor/duck';

/*
 * UI-RELATED
 */
const SELECT_ASSET = '§Fonio/AssetsManager/SELECT_ASSET';
const DESELECT_ASSET = '§Fonio/AssetsManager/DESELECT_ASSET';
const SET_SELECTED_ASSETS = '§Fonio/AssetsManager/SET_SELECTED_ASSETS';
const SET_ASSETS_SEARCH_QUERY = '§Fonio/AssetsManager/SET_ASSETS_SEARCH_QUERY';
const SET_ASSETS_MODAL_STATE = '§Fonio/AssetsManager/SET_ASSETS_MODAL_STATE';
/*
 * CANDIDATE-RELATED
 */
const SET_ASSET_CANDIDATE_TYPE = '§Fonio/AssetsManager/SET_ASSET_CANDIDATE_TYPE';
const SET_ASSET_CANDIDATE_METADATA_VALUE = '§Fonio/AssetsManager/SET_ASSET_CANDIDATE_METADATA_VALUE';
const START_NEW_ASSET_CONFIGURATION = '§Fonio/AssetsManager/START_NEW_ASSET_CONFIGURATION';
const START_EXISTING_ASSET_CONFIGURATION = '§Fonio/AssetsManager/START_EXISTING_ASSET_CONFIGURATION';
const SUBMIT_ASSET_DATA = '§Fonio/AssetsManager/SUBMIT_ASSET_DATA';
/*
 * CONTENT-RELATED
 */
export const CREATE_ASSET = '§Fonio/AssetsManager/CREATE_ASSET';
export const DELETE_ASSET = '§Fonio/AssetsManager/DELETE_ASSET';
export const UPDATE_ASSET = '§Fonio/AssetsManager/UPDATE_ASSET';

export const selectAsset = (id) => ({
  type: SELECT_ASSET,
  id
});
export const deselectAsset = (id) => ({
  type: DESELECT_ASSET,
  id
});
export const setSelectedAssets = (ids = []) => ({
  type: SET_SELECTED_ASSETS,
  ids
});
export const setAssetsSearchQuery = (query) => ({
  type: SET_ASSETS_SEARCH_QUERY,
  query
});
export const setAssetCandidateMetadataValue = (key, value) => ({
  type: SET_ASSET_CANDIDATE_METADATA_VALUE,
  key,
  value
});

export const submitAssetData = (type, data) => ({
  type: SUBMIT_ASSET_DATA,
  promise: (dispatch) => {
    return new Promise((resolve, reject) => {
      switch (type) {
        case 'imageFile':
          return fileIsAnImage(data)
            .then(file => {
              setTimeout(() => {
                dispatch({
                  type: SUBMIT_ASSET_DATA + '_RESET'
                });
              }, 2000);
              return file;
            })
            .then(file => {
              return loadImage(file);
            })
            .then(base64 => {
              setTimeout(() => {
                dispatch({
                  type: SUBMIT_ASSET_DATA + '_RESET'
                });
              }, 2000);
              resolve(base64);
            })
            .catch(e => {
              reject(e);
              setTimeout(() => {
                dispatch({
                  type: SUBMIT_ASSET_DATA + '_RESET'
                });
              }, 2000);
            });
        case 'videoUrl':
          return videoUrlIsValid(data)
            .then(() => {
              setTimeout(() => {
              dispatch({
                type: SUBMIT_ASSET_DATA + '_RESET'
                });
              }, 2000);
              return resolve(data);
            })
            .catch(e => reject(e));
        case 'dataPresentationFile':
          return getFileAsText(data, (err, str) => {
            setTimeout(() => {
              dispatch({
                type: SUBMIT_ASSET_DATA + '_RESET'
                });
              }, 2000);
            try {
              const structuredData = JSON.parse(str);
              resolve(structuredData);
            }
 catch (e) {
              reject(e);
            }
          });
        default:
          reject('unkown input type');
      }
    });
  }
});
/**
 * @param {string} state - the new state - in ['closed', 'new', 'edit']
 */
export const setAssetsModalState = (state) => ({
  type: SET_ASSETS_MODAL_STATE,
  state
});
export const startNewAssetConfiguration = () => ({
  type: START_NEW_ASSET_CONFIGURATION
});
export const startExistingAssetConfiguration = (assetId, asset) => ({
  type: START_EXISTING_ASSET_CONFIGURATION,
  assetId,
  asset
});
export const setAssetCandidateType = (assetType) => ({
  type: SET_ASSET_CANDIDATE_TYPE,
  assetType
});

export const createAsset = (storyId, id, asset) => ({
  type: CREATE_ASSET,
  storyId,
  id,
  asset
});
export const deleteAsset = (storyId, id) => ({
  type: DELETE_ASSET,
  storyId,
  id
});
export const updateAsset = (storyId, id, asset) => ({
  type: UPDATE_ASSET,
  storyId,
  id,
  asset
});

/*
 * Reducers
 */

const emptyAssetMetadata = {
  type: undefined,
  title: '',
  description: '',
  source: ''
};

const ASSETS_UI_DEFAULT_STATE = {
  selectedAssets: [],
  assetsSearchQuery: '',
  assetsModalState: 'closed',
  assetCandidate: {
    metadata: {}
  },
  assetCandidateId: undefined,
  assetDataLoadingState: undefined
};
/**
 * This redux reducer handles the modification of the ui state of assets management
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 */
function assetsUi (state = ASSETS_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    case RESET_APP:
    case SET_ACTIVE_STORY:
      return ASSETS_UI_DEFAULT_STATE;

    case SELECT_ASSET:
      return {
        ...state,
        selectedAssets: [...state.selectedAssets, action.id]
      };
    case DESELECT_ASSET:
      const index = state.selectedAssets.indexOf(action.id);
      return {
        ...state,
        selectedAssets: [
          ...state.selectedAssets.slice(0, index - 1),
          ...state.selectedAssets.slice(index)
        ]
      };
    case SET_SELECTED_ASSETS:
      return {
        ...state,
        selectedAssets: [...action.ids]
      };
    case SET_ASSETS_SEARCH_QUERY:
      return {
        ...state,
        assetsSearchQuery: action.query
      };
    case SET_ASSETS_MODAL_STATE:
      return {
        ...state,
        assetsModalState: action.state
      };
    case START_NEW_ASSET_CONFIGURATION:
      return {
        ...state,
        assetsModalState: 'new',
        assetCandidate: {
          metadata: emptyAssetMetadata
        },
        assetCandidateId: undefined
      };
    case START_EXISTING_ASSET_CONFIGURATION:
      return {
        ...state,
        assetsModalState: 'existing',
        assetCandidateId: action.assetId,
        assetCandidate: {
          ...action.asset
        }
      };
    case SET_ASSET_CANDIDATE_TYPE:
      return {
        ...state,
        assetCandidate: {
          ...state.assetCandidate,
          metadata: {
            ...state.assetCandidate.metadata,
            type: action.assetType
          },
          data: undefined
        }
      };
    case CREATE_ASSET:
    case UPDATE_ASSET:
    case DELETE_ASSET:
      return {
        ...state,
        assetsModalState: 'closed',
        assetCandidateId: undefined
      };
    case SET_ASSET_CANDIDATE_METADATA_VALUE:
      return {
        ...state,
        assetCandidate: {
          ...state.assetCandidate,
          metadata: {
            ...state.assetCandidate.metadata,
            [action.key]: action.value
          }
        }
      };
    case SUBMIT_ASSET_DATA:
      return {
        ...state,
        assetDataLoadingState: 'processing'
      };
    case SUBMIT_ASSET_DATA + '_SUCCESS':
      return {
        ...state,
        assetDataLoadingState: 'success',
        assetCandidate: {
          ...state.assetCandidate,
          data: action.result
        }
      };
    case SUBMIT_ASSET_DATA + '_FAIL':
      return {
        ...state,
        assetDataLoadingState: 'fail'
      };
    case SUBMIT_ASSET_DATA + '_RESET':
      return {
        ...state,
        assetDataLoadingState: undefined
      };
    default:
      return state;
  }
}
/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default persistentReducer(combineReducers({
  assetsUi
}), 'fonio-assets');

/*
 * Selectors
 */
/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
const selectedAssets = (state) => state.assetsUi && state.assetsUi.selectedAssets;
const assetsSearchQuery = (state) => state.assetsUi && state.assetsUi.assetsSearchQuery;
const assetsModalState = (state) => state.assetsUi && state.assetsUi.assetsModalState;
const assetCandidate = (state) => state.assetsUi && state.assetsUi.assetCandidate;
const assetCandidateId = (state) => state.assetsUi && state.assetsUi.assetCandidateId;
const assetDataLoadingState = (state) => state.assetsUi && state.assetsUi.assetDataLoadingState;
const assetCandidateType = (state) => state.assetsUi
                                      && state.assetsUi.assetCandidate
                                      && state.assetsUi.assetCandidate.metadata
                                      && state.assetsUi.assetCandidate.metadata.type;

export const selector = createStructuredSelector({
  selectedAssets,
  assetsSearchQuery,
  assetsModalState,
  assetCandidate,
  assetCandidateId,
  assetCandidateType,
  assetDataLoadingState
});

