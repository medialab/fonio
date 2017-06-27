/**
 * This module exports logic-related elements for the fonio editor feature
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/Editor
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';
import {v4 as uuid} from 'uuid';
import {persistentReducer} from 'redux-pouchdb';

/*
 * Action names
 */
export const RESET_APP = 'RESET_APP';
/*
 * actions related to global stories management in ui
 */
export const START_STORY_CANDIDATE_CONFIGURATION = '$Fonio/Editor/START_STORY_CANDIDATE_CONFIGURATION';
export const APPLY_STORY_CANDIDATE_CONFIGURATION = '$Fonio/Editor/APPLY_STORY_CANDIDATE_CONFIGURATION';
export const SET_ACTIVE_STORY = '$Fonio/Editor/SET_ACTIVE_STORY';
export const UNSET_ACTIVE_STORY = '$Fonio/Editor/UNSET_ACTIVE_STORY';
/*
 * actions related to global ui
 */
const OPEN_STORY_CANDIDATE_MODAL = '$Fonio/Editor/OPEN_STORY_CANDIDATE_MODAL';
const CLOSE_STORY_CANDIDATE_MODAL = '$Fonio/Editor/CLOSE_STORY_CANDIDATE_MODAL';
const OPEN_TAKE_AWAY_MODAL = '$Fonio/Editor/OPEN_TAKE_AWAY_MODAL';
const CLOSE_TAKE_AWAY_MODAL = '$Fonio/Editor/CLOSE_TAKE_AWAY_MODAL';
const SET_UI_MODE = '$Fonio/Editor/SET_UI_MODE';
const SET_ASIDE_UI_MODE = '$Fonio/Editor/SET_ASIDE_UI_MODE';
/*
 * actions related to story edition
 */
export const UPDATE_DRAFT_EDITOR_STATE = '$Fonio/Editor/UPDATE_DRAFT_EDITOR_STATE';
export const UPDATE_DRAFT_EDITORS_STATES = '$Fonio/Editor/UPDATE_DRAFT_EDITORS_STATES';
export const UPDATE_STORY_METADATA_FIELD = '$Fonio/Editor/UPDATE_STORY_METADATA_FIELD';
export const SERIALIZE_EDITOR_CONTENT = 'SERIALIZE_EDITOR_CONTENT';

export const PROMPT_ASSET_EMBED = '$Fonio/Editor/PROMPT_ASSET_EMBED';
export const UNPROMPT_ASSET_EMBED = '$Fonio/Editor/UNPROMPT_ASSET_EMBED';

export const SET_EDITOR_FOCUS = '§Fonio/AssetsManager/SET_EDITOR_FOCUS';

export const CREATE_CONTEXTUALIZER = '§Fonio/AssetsManager/CREATE_CONTEXTUALIZER';
export const UPDATE_CONTEXTUALIZER = '§Fonio/AssetsManager/UPDATE_CONTEXTUALIZER';
export const DELETE_CONTEXTUALIZER = '§Fonio/AssetsManager/DELETE_CONTEXTUALIZER';

export const CREATE_CONTEXTUALIZATION = '§Fonio/AssetsManager/CREATE_CONTEXTUALIZATION';
export const UPDATE_CONTEXTUALIZATION = '§Fonio/AssetsManager/UPDATE_CONTEXTUALIZATION';
export const DELETE_CONTEXTUALIZATION = '§Fonio/AssetsManager/DELETE_CONTEXTUALIZATION';

/*
 * Action creators
 */

export const serializeStoryContent = (id, content) => ({
  type: SERIALIZE_EDITOR_CONTENT,
  content,
  id
});

/**
 * @param {object} story - the data to use for bootstrapping story configuration
 */
export const startStoryCandidateConfiguration = (story) => ({
  type: START_STORY_CANDIDATE_CONFIGURATION,
  story,
  id: story !== undefined && story.id ? story.id : uuid()
});
/**
 * @param {object} story - the data to use for merging back story data from story configuration state
 */
export const applyStoryCandidateConfiguration = (story) => ({
  type: APPLY_STORY_CANDIDATE_CONFIGURATION,
  story
});
/**
 * @param {object} story - the story to set as editor's edited story
 */
export const setActiveStory = (story) => ({
  type: SET_ACTIVE_STORY,
  story
});
/**
 * @param {object} story - the story to unset as editor's edited story
 */
export const unsetActiveStory = () => ({
  type: UNSET_ACTIVE_STORY
});
/**
 *
 */
export const openStoryCandidateModal = () => ({
  type: OPEN_STORY_CANDIDATE_MODAL
});
/**
 *
 */
export const closeStoryCandidateModal = () => ({
  type: CLOSE_STORY_CANDIDATE_MODAL
});
/**
 *
 */
export const openTakeAwayModal = () => ({
  type: OPEN_TAKE_AWAY_MODAL
});
/**
 *
 */
export const closeTakeAwayModal = () => ({
  type: CLOSE_TAKE_AWAY_MODAL
});
/**
 *
 */
export const setUiMode = (mode = 'edition') => ({
  type: SET_UI_MODE,
  mode
});

export const setAsideUiMode = (mode = 'sections') => ({
  type: SET_ASIDE_UI_MODE,
  mode
});

export const updateDraftEditorState = (id, editorState) => ({
  type: UPDATE_DRAFT_EDITOR_STATE,
  editorState,
  id
});
export const updateDraftEditorsStates = (editorsStates) => ({
  type: UPDATE_DRAFT_EDITORS_STATES,
  editorsStates,
});
export const updateStoryMetadataField = (id, key, value) => ({
  type: UPDATE_STORY_METADATA_FIELD,
  id,
  key,
  value
});
export const promptAssetEmbed = (editorId, selection) => ({
  type: PROMPT_ASSET_EMBED,
  editorId,
  selection
});
export const unpromptAssetEmbed = () => ({
  type: UNPROMPT_ASSET_EMBED
});

export const setEditorFocus = (editorFocus) => ({
  type: SET_EDITOR_FOCUS,
  editorFocus
});


export const createContextualizer = (storyId, contextualizerId, contextualizer) => ({
  type: CREATE_CONTEXTUALIZER,
  storyId,
  contextualizerId,
  contextualizer
});
export const updateContextualizer = (storyId, contextualizerId, contextualizer) => ({
  type: UPDATE_CONTEXTUALIZER,
  storyId,
  contextualizerId,
  contextualizer
});
export const deleteContextualizer = (storyId, contextualizerId) => ({
  type: DELETE_CONTEXTUALIZER,
  storyId,
  contextualizerId
});

export const createContextualization = (storyId, contextualizationId, contextualization) => ({
  type: CREATE_CONTEXTUALIZATION,
  storyId,
  contextualizationId,
  contextualization
});
export const updateContextualization = (storyId, contextualizationId, contextualization) => ({
  type: UPDATE_CONTEXTUALIZATION,
  storyId,
  contextualizationId,
  contextualization
});
export const deleteContextualization = (storyId, contextualizationId) => ({
  type: DELETE_CONTEXTUALIZATION,
  storyId,
  contextualizationId
});
/**
 *
 */
export const resetApp = () => ({
  type: RESET_APP
});

/*
 * Reducers
 */

const EDITOR_DEFAULT_STATE = {
};
/**
 * This redux reducer handles the modification of the active story edited by user and related ui states
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 */
function editor(state = EDITOR_DEFAULT_STATE, action) {
  switch (action.type) {
    default:
      return state;
  }
}

const GLOBAL_UI_DEFAULT_STATE = {
    /**
     * Represents whether configuration/new story modal is open
     * @type {boolean}
     */
    storyCandidateModalOpen: false,
    /**
     * Represents whether take away / export modal is open
     * @type {boolean}
     */
    takeAwayModalOpen: false,
    /**
     * Represents  the uuid of the story being edited
     * @type {string}
     */
    activeStoryId: undefined,
    /**
     * Represents  the uuid of the section being edited
     * @type {string}
     */
    activeSectionId: undefined,
    /**
     * Represents whether settings are visible for selected slide
     * @type {boolean}
     */
    slideSettingsPannelOpen: false,
    /**
     * Represents a state machine for the ui screens
     * @type {string}
     */
    uiMode: 'edition', // in ['edition', 'preview'],
    /**
     * Represents the state of the aside column
     * @type {string}
     */
    asideUiMode: 'resources', // in ['sections', 'resources'],
    /**
     * Represents which editor is focused
     * @type {string}
     */
    editorFocus: undefined
};
/**
 * This redux reducer handles the global ui state management (screen & modals opening)
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 */
function globalUi(state = GLOBAL_UI_DEFAULT_STATE, action) {
  let activeSectionId;
  switch (action.type) {
    case RESET_APP:
      return GLOBAL_UI_DEFAULT_STATE;
    case APPLY_STORY_CANDIDATE_CONFIGURATION:
      activeSectionId = action.story.sectionsOrder[0];
      return {
        ...state,
        storyCandidateModalOpen: false,
        activeStoryId: action.story.id,
        activeSectionId
      };
    case SET_ACTIVE_STORY:
      activeSectionId = action.story.sectionsOrder[0];
      return {
        ...state,
        activeStoryId: action.story.id,
        activeSectionId
      };
    case UNSET_ACTIVE_STORY:
      return {
        ...state,
        activeStoryId: undefined,
        activeSectionId: undefined
      };
    case START_STORY_CANDIDATE_CONFIGURATION:
    case OPEN_STORY_CANDIDATE_MODAL:
      return {
        ...state,
        storyCandidateModalOpen: true
      };
    case CLOSE_STORY_CANDIDATE_MODAL:
      return {
        ...state,
        storyCandidateModalOpen: false
      };
    case OPEN_TAKE_AWAY_MODAL:
      return {
        ...state,
        takeAwayModalOpen: true
      };
    case CLOSE_TAKE_AWAY_MODAL:
      return {
        ...state,
        takeAwayModalOpen: false
      };
    case SET_UI_MODE:
      return {
        ...state,
        uiMode: action.mode
      };
    case SET_ASIDE_UI_MODE:
      return {
        ...state,
        asideUiMode: action.mode
      };
    // case PROMPT_ASSET_EMBED:
    //   return {
    //     ...state,
    //     asideUiMode: 'resources'
    //   };
    case SET_EDITOR_FOCUS:
      return {
        ...state,
        editorFocus: action.editorFocus
      };
    default:
      return state;
  }
}

const editorstates = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_DRAFT_EDITOR_STATE:
      return {
        ...state,
        [action.id]: action.editorState
      };
    case UPDATE_DRAFT_EDITORS_STATES:
      return Object.keys(action.editorsStates)
      .reduce((newState, editorId) => ({
        ...newState,
        [editorId]: action.editorsStates[editorId]
      }),
      {} /* state */); // reset editors data to manage memory (this is a bit messy, it should be explicited for instance with two different actions MERGE_EDITORS/REPLACE_EITORS)
    default:
      return state;
  }
};

/**
 * asset requests are separated as they contain not serializable data
 */
const ASSET_REQUEST_DEFAULT_STATE = {
  editorId: undefined,
  selection: undefined,
  assetRequested: false
};
const assetRequeststate = (state = ASSET_REQUEST_DEFAULT_STATE, action) => {
  switch (action.type) {
    case PROMPT_ASSET_EMBED:
      return {
        ...state,
        editorId: action.editorId,
        selection: action.selection,
        assetRequested: true,
      };
    case UNPROMPT_ASSET_EMBED:
      return {
        ...state,
        editorId: undefined,
        selection: undefined,
        assetRequested: false,
      };
    default:
      return state;
  }
};


/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers({
  globalUi: persistentReducer(globalUi, 'fonio-globalUi'),
  editor: persistentReducer(editor, 'fonio-editor'),
  assetRequeststate,
  editorstates
});
// export default persistentReducer(combineReducers({
//   globalUi,
//   editor,
//   editorStates
// }), 'fonio-editor');

/*
 * Selectors
 */

/*
 * Selectors related to global ui
 */
const activeStoryId = state => state.globalUi.activeStoryId;
const activeSectionId = state => state.globalUi.activeSectionId;
const isStoryCandidateModalOpen = state => state.globalUi.storyCandidateModalOpen;
const isTakeAwayModalOpen = state => state.globalUi.takeAwayModalOpen;
const slideSettingsPannelState = state => state.globalUi.slideSettingsPannelState;
const globalUiMode = state => state.globalUi.uiMode;
const asideUiMode = state => state.globalUi.asideUiMode;
const editorFocus = state => state.globalUi.editorFocus;
const editorStates = state => state.editorstates;
const assetRequestState = state => state.assetRequeststate;
const assetRequested = state => state.assetRequested;
/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  activeStoryId,
  activeSectionId,
  globalUiMode,
  asideUiMode,
  isStoryCandidateModalOpen,
  isTakeAwayModalOpen,
  slideSettingsPannelState,
  editorStates,
  editorFocus,
  assetRequestState,
  assetRequested,
});
