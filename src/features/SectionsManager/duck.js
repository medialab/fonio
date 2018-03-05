/**
 * This module exports logic-related elements for configuring the settings of a story
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StorysManager
 */
import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';


/*
 * Action names
 */
import {
  RESET_APP,
  SET_ACTIVE_STORY,
} from '../GlobalUi/duck';

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


/**
 * Action creators
 */


/**
 * Selects a section to edit
 * @param {string} id - the id of the section to select
 * @return {object} action - the redux action to dispatch
 */
export const selectSection = (id) => ({
  type: SELECT_SECTION,
  id
});

/**
 * Deselect the section to edit
 * @param {string} id - the id of the section to deselect
 * @return {object} action - the redux action to dispatch
 */
export const deselectSection = (id) => ({
  type: DESELECT_SECTION,
  id
});

/**
 * Select several sections
 * @param {array<string>} ids - the ids of sections to select
 * @return {object} action - the redux action to dispatch
 */
export const setSelectedSections = (ids = []) => ({
  type: SET_SELECTED_SECTIONS,
  ids
});

/**
 * Sets the section pannel search query
 * @param {string} sectionsSearchQuery - the query to set
 * @return {object} action - the redux action to dispatch
 */
export const setSectionsSearchQuery = (sectionsSearchQuery = '') => ({
  type: SET_SECTIONS_SEARCH_QUERY,
  sectionsSearchQuery
});

/**
 * Set a metadata prop in the section candidate
 * @param {string} key - key of the metadata object to change
 * @param {string} value - value to set
 * @return {object} action - the redux action to dispatch
 */
export const setSectionCandidateMetadataValue = (key, value) => ({
  type: SET_SECTION_CANDIDATE_METADATA_VALUE,
  key,
  value
});

/**
 * Starts the configuration of an existing section
 * @param {string} sectionId - id of the section to set
 * @param {object} section - data of the section
 * @return {object} action - the redux action to dispatch
 */
export const startExistingSectionConfiguration = (sectionId, section) => ({
  type: START_EXISTING_SECTION_CONFIGURATION,
  sectionId,
  section
});

/**
 * Sets the id of active section
 * @param {string} sectionId - id of the section to set as active
 * @return {object} action - the redux action to dispatch
 */
export const setActiveSectionId = (sectionId) => ({
  type: SET_ACTIVE_SECTION_ID,
  sectionId,
});

/**
 * Sets the state of the section model
 * @param {string} sectionsModalState - state of the section modal (in ['closed', 'existing'])
 * @return {object} action - the redux action to dispatch
 */
export const setSectionsModalState = (sectionsModalState) => ({
  type: SET_SECTIONS_MODAL_STATE,
  sectionsModalState
});

/**
 * Launches the prompt for deleting a section (e.g. 'are you sure you want to delete this section ?')
 * @param {string} sectionId - the id of the section concerned with the prompt
 * @return {object} action - the redux action to dispatch
 */
export const requestDeletePrompt = (sectionId) => ({
  type: REQUEST_DELETE_PROMPT,
  sectionId
});

/**
 * Dismisses section delete prompt
 * @return {object} action - the redux action to dispatch
 */
export const abortDeletePrompt = () => ({
  type: ABORT_DELETE_PROMPT
});

/**
 * Updates the order of sections in the summary
 * @param {string} storyId - id of the story to update
 * @param {array<string>} sectionsOrder - list of the stories ordered for the summary
 * @return {object} action - the redux action to dispatch
 */
export const updateSectionsOrder = (storyId, sectionsOrder) => ({
  type: UPDATE_SECTIONS_ORDER,
  storyId,
  sectionsOrder
});


/**
 * Creates a new section
 * @param {string} storyId - id of the story to update
 * @param {string} sectionId - id of the new section
 * @param {object} section - data of the new section
 * @param {boolean} appendToSectionsOrder - whether to append the new section to the summary
 * @return {object} action - the redux action to dispatch
 */
export const createSection = (storyId, sectionId, section, appendToSectionsOrder) => ({
  type: CREATE_SECTION,
  storyId,
  sectionId,
  section,
  appendToSectionsOrder
});

/**
 * Updates the whole content of a section by replacing its content
 * @param {string} storyId - the id of the story to update
 * @param {string} sectionId - the id of the section to update
 * @param {object} section - the data of the new section
 * @return {object} action - the redux action to dispatch
 */
export const updateSection = (storyId, sectionId, section) => ({
  type: UPDATE_SECTION,
  section,
  storyId,
  sectionId,
});

/**
 * Deletes a section
 * @param {string} storyId - the id of the story to update
 * @param {string} sectionId - the id of the section to delete
 * @return {object} action - the redux action to dispatch
 */
export const deleteSection = (storyId, sectionId) => ({
  type: DELETE_SECTION,
  storyId,
  sectionId,
});

/*
 * Reducers
 */

const SECTIONS_UI_DEFAULT_STATE = {

  /**
   * ids of the sections being selected
   */
  selectedSections: [],

  /**
   * current search query
   */
  sectionsSearchQuery: '',

  /**
   * modal state (in ['closed', 'existing', 'new'])
   */
  sectionsModalState: 'closed',

  /**
   * section candidate data (displayed in configuration view)
   */
  sectionCandidate: {
    metadata: {}
  },

  /**
   * id of the section being configured
   */
  sectionCandidateId: undefined,

  /**
   * sections are prompted for a choice
   */
  sectionsPrompted: false,

  /**
   * current edited section id
   */
  activeSectionId: undefined,

  /**
   * id of the section that is prompted to delete (e.g. "are you sure ...")
   * @type string
   */
  sectionPromptedToDelete: undefined,

};

/**
 * This redux reducer handles the modification of the ui state of sections management
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the new state
 */
function sectionsUi (state = SECTIONS_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    case RESET_APP:
    // case SET_ACTIVE_STORY:
      return SECTIONS_UI_DEFAULT_STATE;

    // sections seleciton and deselection handling
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
    // the search query in the resource pannel is changed
    case SET_SECTIONS_SEARCH_QUERY:
      return {
        ...state,
        sectionsSearchQuery: action.sectionsSearchQuery
      };
    // sections modal is changed ('closed', 'existing')
    case SET_SECTIONS_MODAL_STATE:
      return {
        ...state,
        sectionsModalState: action.state
      };
    // section deletion is asked
    case REQUEST_DELETE_PROMPT:
      const {
        sectionId
      } = action;
      return {
        ...state,
        sectionPromptedToDelete: sectionId
      };
    // section deletion is dismissed
    case ABORT_DELETE_PROMPT:
      return {
        ...state,
        sectionPromptedToDelete: undefined
      };
    // modal is opened for an existing section
    case START_EXISTING_SECTION_CONFIGURATION:
      return {
        ...state,
        sectionsModalState: 'existing',
        sectionCandidateId: action.sectionId,
        sectionCandidate: {
          ...action.section
        }
      };
    // a section is created
    case CREATE_SECTION:
      return {
        ...state,
        sectionsModalState: 'closed',
        sectionCandidateId: undefined,
        activeSectionId: action.sectionId
      };
    // a section is updated
    case UPDATE_SECTION:
      return {
        ...state,
        sectionsModalState: 'closed',
        sectionCandidateId: undefined,
      };
    // a section is deleted
  case DELETE_SECTION:
      return {
        ...state,
        sectionsModalState: 'closed',
        sectionCandidateId: undefined,
        activeSectionId: state.activeSectionId === action.sectionId ? undefined : state.activeSectionId
      };
    // a story is opened
    case SET_ACTIVE_STORY:
      return {
        ...SECTIONS_UI_DEFAULT_STATE,
        activeSectionId: action.story.sectionsOrder[0],
      };
    // metadata is changed in section configuration
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
    // active section is changed
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
export default combineReducers({
  sectionsUi
});

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

