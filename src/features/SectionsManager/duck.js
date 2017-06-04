/**
 * This module exports logic-related elements for configuring the settings of a story
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StorysManager
 */
import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';
import {persistentReducer} from 'redux-pouchdb';


/*
 * Action names
 */
import {
  RESET_APP,
  SET_ACTIVE_STORY,
  APPLY_STORY_CANDIDATE_CONFIGURATION,
} from '../Editor/duck';

/*
 * UI-RELATED
 */
const SELECT_SECTION = '§Fonio/SectionsManager/SELECT_SECTION';
const DESELECT_SECTION = '§Fonio/SectionsManager/DESELECT_SECTION';
const SET_SELECTED_SECTIONS = '§Fonio/SectionsManager/SET_SELECTED_SECTIONS';
const SET_SECTIONS_SEARCH_QUERY = '§Fonio/SectionsManager/SET_SECTIONS_SEARCH_QUERY';
const SET_SECTIONS_MODAL_STATE = '§Fonio/SectionsManager/SET_SECTIONS_MODAL_STATE';
const START_EXISTING_SECTION_CONFIGURATION = '§Fonio/SectionsManager/START_EXISTING_SECTION_CONFIGURATION';
// const APPLY_SECTION_CANDIDATE_CONFIGURATION = '§Fonio/SectionsManager/APPLY_SECTION_CANDIDATE_CONFIGURATION';
const SET_ACTIVE_SECTION_ID = '§Fonio/SectionsManager/SET_ACTIVE_SECTION_ID';
const REQUEST_DELETE_PROMPT = '§Fonio/SectionsManager/REQUEST_DELETE_PROMPT';
const ABORT_DELETE_PROMPT = '§Fonio/SectionsManager/ABORT_DELETE_PROMPT';
/*
 * CONTENT-RELATED
 */
export const CREATE_SECTION = '$Fonio/SectionsManager/CREATE_SECTION';
export const UPDATE_SECTION = '$Fonio/SectionsManager/UPDATE_SECTION';
export const DELETE_SECTION = '$Fonio/SectionsManager/DELETE_SECTION';
export const UPDATE_SECTIONS_ORDER = '$Fonio/SectionsManager/UPDATE_SECTIONS_ORDER';
export const SET_SECTION_CANDIDATE_METADATA_VALUE = '$Fonio/SectionsManager/SET_SECTION_CANDIDATE_METADATA_VALUE';
export const selectSection = (id) => ({
  type: SELECT_SECTION,
  id
});
export const deselectSection = (id) => ({
  type: DESELECT_SECTION,
  id
});
export const setSelectedSections = (ids = []) => ({
  type: SET_SELECTED_SECTIONS,
  ids
});
export const setSectionsSearchQuery = (sectionsSearchQuery) => ({
  type: SET_SECTIONS_SEARCH_QUERY,
  sectionsSearchQuery
});
export const setSectionCandidateMetadataValue = (key, value) => ({
  type: SET_SECTION_CANDIDATE_METADATA_VALUE,
  key,
  value
});

export const startExistingSectionConfiguration = (sectionId, section) => ({
  type: START_EXISTING_SECTION_CONFIGURATION,
  sectionId,
  section
});

export const setActiveSectionId = (sectionId) => ({
  type: SET_ACTIVE_SECTION_ID,
  sectionId,
});

export const setSectionsModalState = (sectionsModalState) => ({
  type: SET_SECTIONS_MODAL_STATE,
  sectionsModalState
});

export const requestDeletePrompt = (sectionId) => ({
  type: REQUEST_DELETE_PROMPT,
  sectionId
});

export const abortDeletePrompt = () => ({
  type: ABORT_DELETE_PROMPT
});

export const updateSectionsOrder = (storyId, sectionsOrder) => ({
  type: UPDATE_SECTIONS_ORDER,
  storyId,
  sectionsOrder
});

export const createSection = (storyId, sectionId, section, appendToSectionsOrder) => ({
  type: CREATE_SECTION,
  storyId,
  sectionId,
  section,
  appendToSectionsOrder
});
export const updateSection = (storyId, sectionId, section) => ({
  type: UPDATE_SECTION,
  section,
  storyId,
  sectionId,
});
export const deleteSection = (storyId, sectionId) => ({
  type: DELETE_SECTION,
  storyId,
  sectionId,
});

/*
 * Reducers
 */

const SECTIONS_UI_DEFAULT_STATE = {
  selectedSections: [],
  sectionsSearchQuery: '',
  sectionsModalState: 'closed',
  sectionCandidate: {
    metadata: {}
  },
  sectionCandidateId: undefined,
  sectionDataLoadingState: undefined,
  sectionsPrompted: false,
  activeSectionId: undefined,
  sectionPromptedToDelete: undefined
};
/**
 * This redux reducer handles the modification of the ui state of sections management
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 */
function sectionsUi (state = SECTIONS_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    case RESET_APP:
    // case SET_ACTIVE_STORY:
      return SECTIONS_UI_DEFAULT_STATE;

    case SELECT_SECTION:
      return {
        ...state,
        selectedSections: [...state.selectedSections, action.id]
      };
    case DESELECT_SECTION:
      const index = state.selectedSections.indexOf(action.id);
      return {
        ...state,
        selectedSections: [
          ...state.selectedSections.slice(0, index - 1),
          ...state.selectedSections.slice(index)
        ]
      };
    case SET_SELECTED_SECTIONS:
      return {
        ...state,
        selectedSections: [...action.ids]
      };
    case SET_SECTIONS_SEARCH_QUERY:
      return {
        ...state,
        sectionsSearchQuery: action.sectionsSearchQuery
      };
    case SET_SECTIONS_MODAL_STATE:
      return {
        ...state,
        sectionsModalState: action.state
      };

    case REQUEST_DELETE_PROMPT:
      const {
        sectionId
      } = action;
      return {
        ...state,
        sectionPromptedToDelete: sectionId
      };
    case ABORT_DELETE_PROMPT:
      return {
        ...state,
        sectionPromptedToDelete: undefined
      };
    case START_EXISTING_SECTION_CONFIGURATION:
      return {
        ...state,
        sectionsModalState: 'existing',
        sectionCandidateId: action.sectionId,
        sectionCandidate: {
          ...action.section
        }
      };
    case CREATE_SECTION:
      return {
        ...state,
        sectionsModalState: 'closed',
        sectionCandidateId: undefined,
        activeSectionId: action.sectionId
      };
    case UPDATE_SECTION:
      return {
        ...state,
        sectionsModalState: 'closed',
        sectionCandidateId: undefined,
      };
    case DELETE_SECTION:
      return {
        ...state,
        sectionsModalState: 'closed',
        sectionCandidateId: undefined,
        activeSectionId: state.activeSectionId === action.sectionId ? undefined : state.activeSectionId
      };
    case SET_ACTIVE_STORY:
      return {
        ...SECTIONS_UI_DEFAULT_STATE,
        activeSectionId: action.story.sectionsOrder[0],
      };
    case APPLY_STORY_CANDIDATE_CONFIGURATION:
      return {
        ...state,
        activeSectionId: action.story.sectionsOrder[0],
      };
    case SET_SECTION_CANDIDATE_METADATA_VALUE:
      return {
        ...state,
        sectionCandidate: {
          ...state.sectionCandidate,
          metadata: {
            ...state.sectionCandidate.metadata,
            [action.key]: action.value
          }
        }
      };
    case SET_ACTIVE_SECTION_ID:
      return {
        ...state,
        activeSectionId: action.sectionId
      };
    default:
      return state;
  }
}
/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default persistentReducer(combineReducers({
  sectionsUi
}), 'fonio-sections');

/*
 * Selectors
 */
/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
const selectedSections = (state) => state.sectionsUi && state.sectionsUi.selectedSections;
const sectionsSearchQuery = (state) => state.sectionsUi && state.sectionsUi.sectionsSearchQuery;
const sectionsModalState = (state) => state.sectionsUi && state.sectionsUi.sectionsModalState;
const sectionCandidate = (state) => state.sectionsUi && state.sectionsUi.sectionCandidate;
const sectionCandidateId = (state) => state.sectionsUi && state.sectionsUi.sectionCandidateId;
const activeSectionId = (state) => state.sectionsUi && state.sectionsUi.activeSectionId;

const sectionsPrompted = (state) => state.sectionsUi.sectionsPrompted;
const sectionPromptedToDelete = (state) => state.sectionsUi.sectionPromptedToDelete;

export const selector = createStructuredSelector({
  selectedSections,
  sectionsSearchQuery,
  sectionsModalState,
  sectionCandidate,
  sectionCandidateId,
  sectionsPrompted,
  activeSectionId,
  sectionPromptedToDelete,
});

