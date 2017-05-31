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
  loadImage
} from '../../helpers/assetsUtils';

import {
  createDefaultStory
} from '../../helpers/modelsUtils';

/*
 * Action names
 */
import {
  RESET_APP,
  START_STORY_CANDIDATE_CONFIGURATION,
  APPLY_STORY_CANDIDATE_CONFIGURATION,
  CLOSE_STORY_CANDIDATE_MODAL
} from '../Editor/duck';

const RESET_STORY_CANDIDATE_SETTINGS = '§Fonio/ConfigurationDialog/RESET_STORY_CANDIDATE_SETTINGS';
const SUBMIT_COVER_IMAGE = '§Fonio/ConfigurationDialog/SUBMIT_COVER_IMAGE';

const SET_STORY_CANDIDATE_METADATA = '§Fonio/ConfigurationDialog/SET_STORY_CANDIDATE_METADATA';
/*
 * Action creators
 */
/**
 * @param {string} field - the name of the metadata field to modify
 * @param {string} value - the value to set to the field to modify
 */
export const setCandidateStoryMetadata = (field, value) => ({
  type: SET_STORY_CANDIDATE_METADATA,
  field,
  value
});
export const submitCoverImage = (file) => ({
  type: SUBMIT_COVER_IMAGE,
  promise: (dispatch) => {
    return new Promise((resolve, reject) => {
      return fileIsAnImage(file)
        .then(thatFile => {
            setTimeout(() => {
              dispatch({
                type: SUBMIT_COVER_IMAGE + '_RESET'
              });
            }, 2000);
            return thatFile;
          })
          .then(thatFile => {
            return loadImage(thatFile);
          })
          .then(base64 => {
            setTimeout(() => {
              dispatch({
                type: SUBMIT_COVER_IMAGE + '_RESET'
              });
            }, 2000);
            resolve(base64);
          })
          .catch(e => {
            reject(e);
            setTimeout(() => {
              dispatch({
                type: SUBMIT_COVER_IMAGE + '_RESET'
              });
            }, 2000);
          });
    });
  }
});
/**
 *
 */
export const resetStoryCandidateSettings = () => ({
  type: RESET_STORY_CANDIDATE_SETTINGS
});

const DEFAULT_STORY_CANDIDATE_DATA = {
  /**
   * Restory of the to-update/to-create story data
   * @type {object}
   */
  storyCandidate: {
    metadata: {}
  }
};
/**
 * This redux reducer handles the modification of the data state of a story configuration dialog
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 */
function storyCandidateData(state = DEFAULT_STORY_CANDIDATE_DATA, action) {
  switch (action.type) {
    case RESET_APP:
    case CLOSE_STORY_CANDIDATE_MODAL:
    case APPLY_STORY_CANDIDATE_CONFIGURATION:
      return DEFAULT_STORY_CANDIDATE_DATA;
    case START_STORY_CANDIDATE_CONFIGURATION:
      // configure existing story or setup new ?
      console.log('create default story', createDefaultStory());
      const candidateBeginingState = action.story ? action.story : createDefaultStory();
      console.log('begining state', candidateBeginingState);
      return {
        ...state,
        storyCandidate: {
          ...candidateBeginingState,
          id: action.id
        }
      };
    case SET_STORY_CANDIDATE_METADATA:
      const value = action.field === 'authors' ? action.value.split(',') : action.value;
      return {
        ...state,
        storyCandidate: {
          ...state.storyCandidate,
          metadata: {
            ...state.storyCandidate.metadata,
            [action.field]: value
          }
        }
      };
    case SUBMIT_COVER_IMAGE + '_SUCCESS':
      return {
        ...state,
        storyCandidate: {
          ...state.storyCandidate,
          metadata: {
            ...state.storyCandidate.metadata,
            coverImage: action.result
          }
        }
      };
    case RESET_STORY_CANDIDATE_SETTINGS:
      return DEFAULT_STORY_CANDIDATE_DATA;
    default:
      return state;
  }
}

const STORY_CANDIDATE_UI_DEFAULT_STATE = {
   /**
    * Restory of the status of file fetching status
    * @type {string}
    */
   fetchUserFileStatus: undefined,
   coverImageLoadingState: undefined
};
/**
 * This redux reducer handles the modification of the ui state of a story configuration dialog
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 */
function storyCandidateUi (state = STORY_CANDIDATE_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    case RESET_APP:
    case CLOSE_STORY_CANDIDATE_MODAL:
    case APPLY_STORY_CANDIDATE_CONFIGURATION:
      return STORY_CANDIDATE_UI_DEFAULT_STATE;
    case SUBMIT_COVER_IMAGE:
      return {
        ...state,
        coverImageLoadingState: 'processing'
      };
    case SUBMIT_COVER_IMAGE + '_SUCCESS':
      return {
        ...state,
        coverImageLoadingState: 'success'
      };
    case SUBMIT_COVER_IMAGE + '_FAIL':
      return {
        ...state,
        coverImageLoadingState: 'fail'
      };
    case SUBMIT_COVER_IMAGE + '_RESET':
      return {
        ...state,
        coverImageLoadingState: undefined
      };
    default:
      return state;
  }
}
/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default persistentReducer(combineReducers({
  storyCandidateData,
  storyCandidateUi
}), 'fonio-configuration');

/*
 * Selectors
 */
const storyCandidate = state => state.storyCandidateData &&
  state.storyCandidateData.storyCandidate;
const coverImageLoadingState = state => state.storyCandidateUi && state.storyCandidateUi.coverImageLoadingState;
/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  storyCandidate,
  coverImageLoadingState
});

