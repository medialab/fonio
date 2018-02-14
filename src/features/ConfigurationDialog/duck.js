/**
 * This module exports logic-related elements for configuring the settings of a story
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StorysManager
 */
import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';
import {persistentReducer} from 'redux-pouchdb';
import {v4 as genId} from 'uuid';

import config from '../../../config';
const {timers} = config;

import {
  fileIsAnImage,
  loadImage
} from '../../helpers/assetsUtils';

import {
  createDefaultStory,
  createDefaultSection
} from '../../helpers/modelsUtils';

import validateForm from '../../helpers/formValidator';

/*
 * Action names
 */
import {
  RESET_APP,
  START_STORY_CANDIDATE_CONFIGURATION,
  APPLY_STORY_CANDIDATE_CONFIGURATION,
  CLOSE_STORY_CANDIDATE_MODAL
} from '../GlobalUi/duck';
import {IMPORT_SUCCESS, COPY_STORY} from '../StoriesManager/duck';

const VALIDATE_STORY_CANDIDATE_SETTINGS = '§Fonio/ConfigurationDialog/VALIDATE_STORY_CANDIDATE_SETTINGS';
const RESET_STORY_CANDIDATE_SETTINGS = '§Fonio/ConfigurationDialog/RESET_STORY_CANDIDATE_SETTINGS';
const SUBMIT_STORY_CANDIDATE_SETTINGS = '§Fonio/ConfigurationDialog/SUBMIT_STORY_CANDIDATE_SETTINGS';
const SUBMIT_COVER_IMAGE = '§Fonio/ConfigurationDialog/SUBMIT_COVER_IMAGE';

const SET_STORY_CANDIDATE_PASSWORD = '§Fonio/ConfigurationDialog/SET_STORY_CANDIDATE_PASSWORD';
const SET_STORY_CANDIDATE_METADATA = '§Fonio/ConfigurationDialog/SET_STORY_CANDIDATE_METADATA';
/*
 * Action creators
 */

/**
 * Sets a new metadata prop in the story candidate data
 * @param {string} field - the name of the metadata field to modify
 * @param {string} value - the value to set to the field to modify
 * @return {object} action - the redux action to dispatch
 */
export const setCandidateStoryMetadata = (field, value) => ({
  type: SET_STORY_CANDIDATE_METADATA,
  field,
  value
});

/**
 * Sets a new metadata prop in the story candidate data
 * @param {string} field - the name of the metadata field to modify
 * @param {string} value - the value to set to the field to modify
 * @return {object} action - the redux action to dispatch
 */
export const setCandidateStoryPassword = (password) => ({
  type: SET_STORY_CANDIDATE_PASSWORD,
  password
});

/**
 * Submits an image to use for the story cover
 * (as base64 data)
 * @param {File} file - the file to propose for the story cover
 * @return {object} action - the redux action to dispatch
 */
export const submitCoverImage = (file) => ({
  type: SUBMIT_COVER_IMAGE,
  promise: (dispatch) => {
    return new Promise((resolve, reject) => {
      // first verify the extension corresponds to an image file
      return fileIsAnImage(file)
        .then(thatFile => {
           // possible state model will be removed
           // either the loading succeeds or fail
            setTimeout(() => {
              dispatch({
                type: SUBMIT_COVER_IMAGE + '_RESET'
              });
            }, timers.veryLong);
            return thatFile;
          })
          // then loads the image
          .then(thatFile => {
            return loadImage(thatFile);
          })
          // then resolve with the base64 data
          .then(base64 => {
            setTimeout(() => {
              dispatch({
                type: SUBMIT_COVER_IMAGE + '_RESET'
              });
            }, timers.veryLong);
            resolve(base64);
          })
          // error handler
          .catch(e => {
            reject(e);
            setTimeout(() => {
              dispatch({
                type: SUBMIT_COVER_IMAGE + '_RESET'
              });
            }, timers.veryLong);
          });
    });
  }
});

/**
 * Resets story candidate state to default settings
 * @return {object} action - the redux action to dispatch
 */
export const validateStoryCandidateSettings = (field, value) => ({
  type: VALIDATE_STORY_CANDIDATE_SETTINGS,
  field,
  value
});

/**
 * Resets story candidate state to default settings
 * @return {object} action - the redux action to dispatch
 */
export const submitStoryCandidateSettings = () => ({
  type: SUBMIT_STORY_CANDIDATE_SETTINGS
});
/**
 * Resets story candidate state to default settings
 * @return {object} action - the redux action to dispatch
 */
export const resetStoryCandidateSettings = () => ({
  type: RESET_STORY_CANDIDATE_SETTINGS
});

const DEFAULT_STORY_CANDIDATE_DATA = {

  /**
   * Representation of the to-update/to-create story data
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
 * @return {object} newState - the resulting state
 */
function storyCandidateData(state = DEFAULT_STORY_CANDIDATE_DATA, action) {
  switch (action.type) {
    // cases the candidate state has to be reset
    case RESET_APP:
    case CLOSE_STORY_CANDIDATE_MODAL:
    case APPLY_STORY_CANDIDATE_CONFIGURATION:
      return DEFAULT_STORY_CANDIDATE_DATA;
    case START_STORY_CANDIDATE_CONFIGURATION:
      // configure existing story or setup new ?
      let candidateBeginingState = action.story ? action.story : createDefaultStory();
      // add first section
      if (!action.story) {
        const firstSectionId = genId();
        const firstSection = createDefaultSection();
        firstSection.id = firstSectionId;
        candidateBeginingState = {
          ...candidateBeginingState,
          sections: {
            [firstSectionId]: firstSection
          },
          sectionsOrder: [firstSectionId]
        };
      }
      return {
        ...state,
        storyCandidate: {
          ...candidateBeginingState,
          id: action.id
        }
      };
    case IMPORT_SUCCESS:
      const story = action.data;
      return {
        ...state,
        storyCandidate: {
          ...story,
          id: story.id
        }
      };
    case COPY_STORY + '_SUCCESS':
      return {
        ...state,
        storyCandidate: action.result
      };
    // save in candidate data some metadata
    case SET_STORY_CANDIDATE_METADATA:
      const value = action.value;// action.field === 'authors' ? action.value.split(',') : action.value;
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
    // store new cover image base64 representation
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
    // case reseting the state
    case RESET_STORY_CANDIDATE_SETTINGS:
      return DEFAULT_STORY_CANDIDATE_DATA;
    default:
      return state;
  }
}

const STORY_CANDIDATE_UI_DEFAULT_STATE = {

  /**
  * Representation of the status of file fetching status
  * @type {string}
  */
  fetchUserFileStatus: undefined,
  /**
  * Representation of story password field
  * @type {string}
  */
  storyCandidatePassword: '',
  /**
  * Representation of story title, password, author validation
  * @type {object}
  */
  formErrors: {
    title: undefined,
    password: undefined,
    authors: undefined
  },
  /**
  * Representation of show form errors
  * @type {boolean}
  */
  showErrors: false,
  /**
  * Representation of the status of file upload image
  * @type {string}
  */
  coverImageLoadingState: undefined,

};

/**
 * This redux reducer handles the modification of the ui state of a story configuration dialog
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function storyCandidateUi (state = STORY_CANDIDATE_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    case VALIDATE_STORY_CANDIDATE_SETTINGS:
      const newErrors = validateForm(action.field, action.value);
      return {
        ...state,
        formErrors: {
          ...state.formErrors,
          ...newErrors
        }
      };
    case SUBMIT_STORY_CANDIDATE_SETTINGS:
      return {
        ...state,
        showErrors: true
      };
    case SET_STORY_CANDIDATE_PASSWORD:
      return {
        ...state,
        storyCandidatePassword: action.password
      };
    // case resetting the base state
    case RESET_APP:
    case CLOSE_STORY_CANDIDATE_MODAL:
    case APPLY_STORY_CANDIDATE_CONFIGURATION:
      return STORY_CANDIDATE_UI_DEFAULT_STATE;
    // handling representation of the cover image
    // submission process in the ui state
    case SUBMIT_COVER_IMAGE + '_PENDING':
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
const storyCandidatePassword = state => state.storyCandidateUi && state.storyCandidateUi.storyCandidatePassword;
const showErrors = state => state.storyCandidateUi && state.storyCandidateUi.showErrors;
const formErrors = state => state.storyCandidateUi && state.storyCandidateUi.formErrors;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  storyCandidate,
  coverImageLoadingState,
  storyCandidatePassword,
  showErrors,
  formErrors
});

