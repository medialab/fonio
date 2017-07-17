/**
 * This module exports logic-related elements for the fonio editor feature
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/Editor
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';
import {persistentReducer} from 'redux-pouchdb';

/*
 * actions related to story edition
 */
export const UPDATE_DRAFT_EDITOR_STATE = '$Fonio/StoryEditor/UPDATE_DRAFT_EDITOR_STATE';
export const UPDATE_DRAFT_EDITORS_STATES = '$Fonio/StoryEditor/UPDATE_DRAFT_EDITORS_STATES';
export const UPDATE_STORY_METADATA_FIELD = '$Fonio/StoryEditor/UPDATE_STORY_METADATA_FIELD';
export const SERIALIZE_EDITOR_CONTENT = 'SERIALIZE_EDITOR_CONTENT';

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

export const serializeStoryContent = (id, content) => ({
  type: SERIALIZE_EDITOR_CONTENT,
  content,
  id
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
      {} /* state */); // reset editors data to manage memory (this is a bit messy, it should be explicited for instance with two different actions MERGE_EDITORS/REPLACE_EDITORS)
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

const EDITOR_FOCUS_DEFAULT_STATE = {
/**
   * Represents which editor is focused
   * @type {string}
   */
  editorFocus: undefined
};
const editorFocusState = (state = EDITOR_FOCUS_DEFAULT_STATE, action) => {
  switch (action.type) {
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
  editor: persistentReducer(editor, 'fonio-editor'),
  assetRequeststate,
  editorstates,
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
