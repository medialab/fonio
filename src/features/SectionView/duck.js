/**
 * This module exports logic-related elements for the fonio section view feature
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/SectionView
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';

import {getStatePropFromActionSet} from '../../helpers/reduxUtils';

import resourceSchema from 'quinoa-schemas/resource';

/**
 * ===================================================
 * ACTION NAMES
 * ===================================================
 */
/**
 * UI
 */
const SET_ASIDE_TAB_MODE = 'SET_ASIDE_TAB_MODE';
const SET_ASIDE_TAB_COLLAPSED = 'SET_ASIDE_TAB_COLLAPSED';
const SET_MAIN_COLUMN_MODE = 'SET_MAIN_COLUMN_MODE';
const SET_RESOURCE_SORT_VISIBLE = 'SET_RESOURCE_SORT_VISIBLE';
const SET_RESOURCE_FILTER_VISIBLE = 'SET_RESOURCE_FILTER_VISIBLE';
const SET_RESOURCE_FILTER_VALUES = 'SET_RESOURCE_FILTER_VALUES';
const SET_RESOURCE_SORT_VALUE = 'SET_RESOURCE_SORT_VALUE';
const SET_RESOURCE_SEARCH_STRING = 'SET_RESOURCE_SEARCH_STRING';


/*
 * actions related to section edition
 */
export const UPDATE_DRAFT_EDITOR_STATE = 'UPDATE_DRAFT_EDITOR_STATE';
export const UPDATE_DRAFT_EDITORS_STATES = 'UPDATE_DRAFT_EDITORS_STATES';

export const PROMPT_ASSET_EMBED = 'PROMPT_ASSET_EMBED';
export const UNPROMPT_ASSET_EMBED = 'UNPROMPT_ASSET_EMBED';
export const SET_ASSET_REQUEST_CONTENT_ID = 'SET_ASSET_REQUEST_CONTENT_ID';

export const SET_EDITOR_FOCUS = 'SET_EDITOR_FOCUS';
/**
 * data
 */

/**
 * ===================================================
 * ACTION CREATORS
 * ===================================================
 */
export const setAsideTabMode = payload => ({
  type: SET_ASIDE_TAB_MODE,
  payload,
});

export const setAsideTabCollapsed = payload => ({
  type: SET_ASIDE_TAB_COLLAPSED,
  payload,
});

export const setMainColumnMode = payload => ({
  type: SET_MAIN_COLUMN_MODE,
  payload,
});

export const setResourceFilterVisible = payload => ({
  type: SET_RESOURCE_FILTER_VISIBLE,
  payload
});

export const setResourceSortVisible = payload => ({
  type: SET_RESOURCE_SORT_VISIBLE,
  payload
});

export const setResourceFilterValues = payload => ({
  type: SET_RESOURCE_FILTER_VALUES,
  payload
});

export const setResourceSortValue = payload => ({
  type: SET_RESOURCE_SORT_VALUE,
  payload
});

export const setResourceSearchString = payload => ({
  type: SET_RESOURCE_SEARCH_STRING,
  payload
});

/**
 * Action creators related to section edition
 */

/**
 * Updates a specific editor state
 * @param {id} id - id of the editor state to update (uuid of a section or of a note)
 * @param {EditorState} editorState - the new editor state
 * @return {object} action - the redux action to dispatch
 */
export const updateDraftEditorState = (id, editorState) => ({
  type: UPDATE_DRAFT_EDITOR_STATE,
  payload: {
    editorState,
    id
  },
});

/**
 * Updates all active editor states
 * @param {object}  editorStates - map of the editor states (keys are uuids of sections or notes)
 * @return {object} action - the redux action to dispatch
 */
export const updateDraftEditorsStates = (editorsStates) => ({
  type: UPDATE_DRAFT_EDITORS_STATES,
  payload: {
    editorsStates,
  },
});

/**
 * Prompts to embed an asset
 * @param {string} editorId - id of the editor in which asset is prompted
 * @param {SelectionState} selection - current selection of the editor
 * @return {object} action - the redux action to dispatch
 */
export const promptAssetEmbed = (editorId, selection) => ({
  type: PROMPT_ASSET_EMBED,
  payload: {
    editorId,
    selection
  },
});

/**
 * Unprompts asset embed
 * @return {object} action - the redux action to dispatch
 */
export const unpromptAssetEmbed = () => ({
  type: UNPROMPT_ASSET_EMBED
});


export const setAssetRequestContentId = contentId => ({
  type: SET_ASSET_REQUEST_CONTENT_ID,
  payload: {
    contentId,
  },
});

/**
 * Sets which editor has the focus for edition
 * @param {string} editorFocus  - id of the editor to focus to
 * @return {object} action - the redux action to dispatch
 */
export const setEditorFocus = (editorFocus) => ({
  type: SET_EDITOR_FOCUS,
  payload: {
    editorFocus,
  },
});

/**
 * ===================================================
 * REDUCERS
 * ===================================================
 */

const defaultResourceFilterValues = Object.keys(resourceSchema.definitions)
  .reduce((result, type) => ({
    ...result,
    [type]: true
  }), {});

const UI_DEFAULT_STATE = {
  asideTabMode: 'library',
  asideTabCollapsed: false,
  mainColumnMode: 'edition',
  resourceSortVisible: false,
  resourceFilterVisible: false,
  resourceSearchString: '',
  resourceFilterValues: defaultResourceFilterValues,
  resourceSortValue: 'title'
};

/**
 * This redux reducer handles the state of the ui
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the resulting state
 */
function ui(state = UI_DEFAULT_STATE, action) {
  const {payload} = action;
  switch (action.type) {
    case SET_ASIDE_TAB_MODE:
    case SET_ASIDE_TAB_COLLAPSED:
    case SET_MAIN_COLUMN_MODE:
    case SET_RESOURCE_SORT_VISIBLE:
    case SET_RESOURCE_FILTER_VISIBLE:
    case SET_RESOURCE_FILTER_VALUES:
    case SET_RESOURCE_SORT_VALUE:
    case SET_RESOURCE_SEARCH_STRING:
      const propName = getStatePropFromActionSet(action.type);
      return {
        ...state,
        [propName]: payload
      };
    default:
      return state;
  }
}

/**
 * Editor states reducer
 * It has no default state since this reducer is only composed
 * of uuid keys that correspond to active
 * draft-js editor states (uuids correspond to either section
 * ids for main contents' editorStates or note ids for note contents editorStates)
 */
const editorstates = (state = {}, action) => {
  const {payload} = action;
  switch (action.type) {
    // a draft editor is updated
    case UPDATE_DRAFT_EDITOR_STATE:
      return {
        ...state,
        // editorState is an EditorState ImmutableRecord
        [payload.id]: payload.editorState
      };
    case UPDATE_DRAFT_EDITORS_STATES:
      return Object.keys(payload.editorsStates)
      .reduce((newState, editorId) => ({
        ...newState,
        // editorState is an EditorState ImmutableRecord
        [editorId]: payload.editorsStates[editorId]
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
  const {payload} = action;
  switch (action.type) {
    case SET_ASSET_REQUEST_CONTENT_ID:
      return {
        ...state,
        // in what editor is the asset prompted
        editorId: payload.contentId
      };

    // an asset is prompted
    case PROMPT_ASSET_EMBED:
      return {
        ...state,
        // in what editor is the asset prompted
        editorId: payload.editorId,
        // where is the asset prompted in the editor
        selection: payload.selection,
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
  editorFocus: undefined,
  /**
   * Represents the previous editor focus
   * @type {string}
   */
  previousEditorFocus: undefined
};

/**
 * Handles the state of dcurrent editors focus
 * @param {object} state - the previous state
 * @param {object} action - the dispatched action
 * @return {object} state - the new state
 */
const editorFocusState = (state = EDITOR_FOCUS_DEFAULT_STATE, action) => {
  const {payload} = action;
  switch (action.type) {
    // an editor is focused
    case SET_EDITOR_FOCUS:
      return {
        ...state,
        editorFocus: payload.editorFocus,
        previousEditorFocus: payload.editorFocus
      };
    default:
      return state;
  }
};


/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers({
  ui,
  assetRequeststate,
  editorstates,
  editorFocusState,
});

/**
 * ===================================================
 * SELECTORS
 * ===================================================
 */

const asideTabMode = state => state.ui.asideTabMode;
const asideTabCollapsed = state => state.ui.asideTabCollapsed;
const mainColumnMode = state => state.ui.mainColumnMode;
const resourceSortVisible = state => state.ui.resourceSortVisible;
const resourceFilterVisible = state => state.ui.resourceFilterVisible;
const resourceFilterValues = state => state.ui.resourceFilterValues;
const resourceSortValue = state => state.ui.resourceSortValue;
const resourceSearchString = state => state.ui.resourceSearchString;

const editorStates = state => state.editorstates;
const assetRequestState = state => state.assetRequeststate;
const assetRequested = state => state.assetRequested;
const editorFocus = state => state.editorFocusState.editorFocus;
const previousEditorFocus = state => state.editorFocusState.previousEditorFocus;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  asideTabMode,
  asideTabCollapsed,
  mainColumnMode,

  resourceSortVisible,
  resourceFilterVisible,
  resourceFilterValues,
  resourceSortValue,
  resourceSearchString,

  editorStates,
  assetRequestState,
  assetRequested,
  editorFocus,
  previousEditorFocus,
});
