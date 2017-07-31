/**
 * This module exports logic-related elements for the fonio editor feature
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/Editor
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';

/*
 * actions related to story edition
 */
export const UPDATE_DRAFT_EDITOR_STATE = '$Fonio/StoryEditor/UPDATE_DRAFT_EDITOR_STATE';
export const UPDATE_DRAFT_EDITORS_STATES = '$Fonio/StoryEditor/UPDATE_DRAFT_EDITORS_STATES';
export const UPDATE_STORY_METADATA_FIELD = '$Fonio/StoryEditor/UPDATE_STORY_METADATA_FIELD';

export const PROMPT_ASSET_EMBED = '$Fonio/StoryEditor/PROMPT_ASSET_EMBED';
export const UNPROMPT_ASSET_EMBED = '$Fonio/StoryEditor/UNPROMPT_ASSET_EMBED';

export const CREATE_CONTEXTUALIZER = '§Fonio/AssetsManager/CREATE_CONTEXTUALIZER';
export const UPDATE_CONTEXTUALIZER = '§Fonio/AssetsManager/UPDATE_CONTEXTUALIZER';
export const DELETE_CONTEXTUALIZER = '§Fonio/AssetsManager/DELETE_CONTEXTUALIZER';

export const CREATE_CONTEXTUALIZATION = '§Fonio/AssetsManager/CREATE_CONTEXTUALIZATION';
export const UPDATE_CONTEXTUALIZATION = '§Fonio/AssetsManager/UPDATE_CONTEXTUALIZATION';
export const DELETE_CONTEXTUALIZATION = '§Fonio/AssetsManager/DELETE_CONTEXTUALIZATION';

export const SET_EDITOR_FOCUS = '§Fonio/AssetsManager/SET_EDITOR_FOCUS';

import {
  RESET_APP
} from '../GlobalUi/duck';

/*
 * Action creators
 */


/**
 * Updates a specific editor state
 * @param {id} id - id of the editor state to update (uuid of a section or of a note)
 * @param {EditorState} editorState - the new editor state
 * @return {object} action - the redux action to dispatch
 */
export const updateDraftEditorState = (id, editorState) => ({
  type: UPDATE_DRAFT_EDITOR_STATE,
  editorState,
  id
});

/**
 * Updates all active editor states
 * @param {object}  editorStates - map of the editor states (keys are uuids of sections or notes)
 * @return {object} action - the redux action to dispatch
 */
export const updateDraftEditorsStates = (editorsStates) => ({
  type: UPDATE_DRAFT_EDITORS_STATES,
  editorsStates,
});

/**
 * Updates a field in the metadata of a section
 * @param {string} id  - id of the section to update
 * @param {string} key - metadata key to update
 * @param {string|number} value - value to update to
 * @return {object} action - the redux action to dispatch
 */
export const updateStoryMetadataField = (id, key, value) => ({
  type: UPDATE_STORY_METADATA_FIELD,
  id,
  key,
  value
});

/**
 * Prompts to embed an asset
 * @param {string} editorId - id of the editor in which asset is prompted
 * @param {SelectionState} selection - current selection of the editor
 * @return {object} action - the redux action to dispatch
 */
export const promptAssetEmbed = (editorId, selection) => ({
  type: PROMPT_ASSET_EMBED,
  editorId,
  selection
});

/**
 * Unprompts asset embed
 * @return {object} action - the redux action to dispatch
 */
export const unpromptAssetEmbed = () => ({
  type: UNPROMPT_ASSET_EMBED
});

/**
 * Sets which editor has the focus for edition
 * @param {string} editorFocus  - id of the editor to focus to
 * @return {object} action - the redux action to dispatch
 */
export const setEditorFocus = (editorFocus) => ({
  type: SET_EDITOR_FOCUS,
  editorFocus
});

/**
 * Creates a contextualizer
 * @param {string} storyId  - id of the story to update
 * @param {string} contextualizerId  - id of the contextualizer to update
 * @param {object} contextualizer  - new contextualizer data
 * @return {object} action - the redux action to dispatch
 */
export const createContextualizer = (storyId, contextualizerId, contextualizer) => ({
  type: CREATE_CONTEXTUALIZER,
  storyId,
  contextualizerId,
  contextualizer
});

/**
 * Updates a contextualizer
 * @param {string} storyId  - id of the story to update
 * @param {string} contextualizerId  - id of the contextualizer to update
 * @param {object} contextualizer  - new contextualizer data
 * @return {object} action - the redux action to dispatch
 */
export const updateContextualizer = (storyId, contextualizerId, contextualizer) => ({
  type: UPDATE_CONTEXTUALIZER,
  storyId,
  contextualizerId,
  contextualizer
});

/**
 * Deletes a contextualizer
 * @param {string} storyId  - id of the story to update
 * @param {string} contextualizerId  - id of the contextualizer to update
 * @return {object} action - the redux action to dispatch
 */
export const deleteContextualizer = (storyId, contextualizerId) => ({
  type: DELETE_CONTEXTUALIZER,
  storyId,
  contextualizerId
});

/**
 * Creates a contextualization
 * @param {string} storyId  - id of the story to update
 * @param {string} contextualizationId  - id of the contextualization to update
 * @param {object} contextualization  - new contextualization data
 * @return {object} action - the redux action to dispatch
 */
export const createContextualization = (storyId, contextualizationId, contextualization) => ({
  type: CREATE_CONTEXTUALIZATION,
  storyId,
  contextualizationId,
  contextualization
});

/**
 * Updates a contextualization
 * @param {string} storyId  - id of the story to update
 * @param {string} contextualizationId  - id of the contextualization to update
 * @param {object} contextualization  - new contextualization data
 * @return {object} action - the redux action to dispatch
 */
export const updateContextualization = (storyId, contextualizationId, contextualization) => ({
  type: UPDATE_CONTEXTUALIZATION,
  storyId,
  contextualizationId,
  contextualization
});

/**
 * Deletes a contextualization
 * @param {string} storyId  - id of the story to update
 * @param {string} contextualizationId  - id of the contextualization to update
 * @return {object} action - the redux action to dispatch
 */
export const deleteContextualization = (storyId, contextualizationId) => ({
  type: DELETE_CONTEXTUALIZATION,
  storyId,
  contextualizationId
});

/**
 * Resets the app to its default state
 * @return {object} action - the redux action to dispatch
 */
export const resetApp = () => ({
  type: RESET_APP
});

/*
 * Reducers
 */


/**
 * Editor states reducer
 * It has no default state since this reducer is only composed
 * of uuid keys that correspond to active
 * draft-js editor states (uuids correspond to either section
 * ids for main contents' editorStates or note ids for note contents editorStates)
 */
const editorstates = (state = {}, action) => {
  switch (action.type) {
    // a draft editor is updated
    case UPDATE_DRAFT_EDITOR_STATE:
      return {
        ...state,
        // editorState is an EditorState ImmutableRecord
        [action.id]: action.editorState
      };
    case UPDATE_DRAFT_EDITORS_STATES:
      return Object.keys(action.editorsStates)
      .reduce((newState, editorId) => ({
        ...newState,
        // editorState is an EditorState ImmutableRecord
        [editorId]: action.editorsStates[editorId]
      }),
      // reset editors data to optimize memory management
      // todo: this is a bit messy, it should be explicited for instance with two different actions 'MERGE_EDITORS'/'REPLACE_EDITORS'
      {} /* state */);
    default:
      return state;
  }
};


/**
 * asset requests are separated as they contain not serializable data
 */
const ASSET_REQUEST_DEFAULT_STATE = {

  /**
   * Id of the editor being prompted for asset (uuid of the section or uuid of the note)
   */
  editorId: undefined,

  /**
   * selection state of the editor being prompted
   * @type {SelectionState}
   */
  selection: undefined,

  /**
   * Whether an asset is requested
   */
  assetRequested: false
};

/**
 * Handles the state change of asset request state
 * @param {object} state - the previous state
 * @param {object} action - the dispatched action
 * @return {object} state - the new state
 */
const assetRequeststate = (state = ASSET_REQUEST_DEFAULT_STATE, action) => {
  switch (action.type) {
    // an asset is prompted
    case PROMPT_ASSET_EMBED:
      return {
        ...state,
        // in what editor is the asset prompted
        editorId: action.editorId,
        // where is the asset prompted in the editor
        selection: action.selection,
        // asset is prompted
        assetRequested: true,
      };
    // assets prompt is dismissed
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
 * Default state of the editor focus reducer
 * It handles only focus-related matters
 */
const EDITOR_FOCUS_DEFAULT_STATE = {

/**
   * Represents which editor is focused
   * @type {string}
   */
  editorFocus: undefined
};

/**
 * Handles the state of dcurrent editors focus
 * @param {object} state - the previous state
 * @param {object} action - the dispatched action
 * @return {object} state - the new state
 */
const editorFocusState = (state = EDITOR_FOCUS_DEFAULT_STATE, action) => {
  switch (action.type) {
    // an editor is focused
    case SET_EDITOR_FOCUS:
      return {
        ...state,
        editorFocus: action.editorFocus
      };
    default:
      return state;
  }
};


/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers({
  // neither of these reducers are persisted
  // because they are either temporary or containing
  // non-serializable data
  // temporary so not persisted
  assetRequeststate,
  // containing immutable data so not persisted
  editorstates,
  // temporary so not persisted
  editorFocusState
});

/*
 * Selectors
 */

/*
 * Selectors related to global ui
 */
const editorStates = state => state.editorstates;
const assetRequestState = state => state.assetRequeststate;
const assetRequested = state => state.assetRequested;
const editorFocus = state => state.editorFocusState.editorFocus;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  editorStates,
  assetRequestState,
  assetRequested,
  editorFocus,
});
