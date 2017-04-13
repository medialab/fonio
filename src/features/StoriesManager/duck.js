/**
 * This module exports logic-related elements for the management of (locally stored) fonio stories
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StoriesManager
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';
import {persistentReducer} from 'redux-pouchdb';
import {v4 as uuid} from 'uuid';

import {serverUrl} from '../../../secrets';

import {
  convertFromRaw,
  convertToRaw,
  EditorState,
  AtomicBlockUtils,
  Entity,
} from 'draft-js';

/*
 * Action names
 */
import {
  START_CANDIDATE_STORY_CONFIGURATION,
  APPLY_STORY_CANDIDATE_CONFIGURATION,
  UNSET_ACTIVE_STORY,
  SET_ACTIVE_STORY,
  UPDATE_STORY_CONTENT,
  UPDATE_STORY_METADATA_FIELD,
  EMBED_ASSET,
} from '../Editor/duck';

import {
  CREATE_ASSET,
  DELETE_ASSET,
  UPDATE_ASSET
} from '../AssetsManager/duck';

import {
  EXPORT_TO_GIST,
  EXPORT_TO_SERVER
} from '../TakeAwayDialog/duck';

const CREATE_STORY = '§Fonio/StoriesManager/CREATE_STORY';
const DELETE_STORY = '§Fonio/StoriesManager/DELETE_STORY';
const UPDATE_STORY = '§Fonio/StoriesManager/UPDATE_STORY';
const COPY_STORY = '§Fonio/StoriesManager/COPY_STORY';

const PROMPT_DELETE_STORY = '§Fonio/StoriesManager/PROMPT_DELETE_STORY';
const UNPROMPT_DELETE_STORY = '§Fonio/StoriesManager/UNPROMPT_DELETE_STORY';

const IMPORT_ABORD = '§Fonio/StoriesManager/IMPORT_ABORD';
const IMPORT_OVERRIDE_PROMPT = '§Fonio/StoriesManager/IMPORT_OVERRIDE_PROMPT';
const IMPORT_FAIL = '§Fonio/StoriesManager/IMPORT_FAIL';
const IMPORT_SUCCESS = '§Fonio/StoriesManager/IMPORT_SUCCESS';
const IMPORT_RESET = '§Fonio/StoriesManager/IMPORT_RESET';
const SET_IMPORT_FROM_URL_CANDIDATE = '§Fonio/StoriesManager/SET_IMPORT_FROM_URL_CANDIDATE';

/*
 * Action creators
 */
/**
 * @param {string} id - the uuid of the story to create
 * @param {object} story - the data of the story to create
 * @param {boolean} setActive - whether to set the story as active (edited) story in app
 */
export const createStory = (id, story, setActive = true) => ({
  type: CREATE_STORY,
  story,
  setActive,
  id
});
/**
 * @param {object} story - the data of the story to copy
 */
export const copyStory = (story) => ({
  type: COPY_STORY,
  story
});
/**
 * @param {string} id - the uuid of the story to query for deletion
 */
export const promptDeleteStory = (id) => ({
  type: PROMPT_DELETE_STORY,
  id
});
/**
 *
 */
export const unpromptDeleteStory = () => ({
  type: UNPROMPT_DELETE_STORY
});
/**
 * @param {string} id - the uuid of the story to delete
 */
export const deleteStory = (id) => ({
  type: DELETE_STORY,
  id
});
/**
 * @param {string} id - the uuid of the story to update
 * @param {object} story - the data of the story to update
 */
export const updateStory = (id, story) => ({
  type: UPDATE_STORY,
  id,
  story
});
/**
 *
 */
export const importReset = () => ({
  type: IMPORT_RESET
});
/**
 *
 */
export const abordImport = () => ({
  type: IMPORT_ABORD
});
/**
 * @param {object} candidate - the data of the story waiting to be imported or not instead of existing one
 */
export const promptOverrideImport = (candidate) => ({
  type: IMPORT_OVERRIDE_PROMPT,
  candidate
});
/**
 * @param {object} data - the data of the imported story
 */
export const importSuccess = (data) => (dispatch) => {
  dispatch({
    type: IMPORT_SUCCESS,
    data
  });
  // resets import state after a while
  setTimeout(() => dispatch(importReset()), 5000);
};
/**
 * @param {string} error - the error type for the import failure
 */
export const importFail = (error) => (dispatch) => {
  dispatch({
    type: IMPORT_FAIL,
    error
  });
  // resets import state after a while
  setTimeout(() => dispatch(importReset()), 5000);
};
/**
 * @param {string}  value - the new value to set for import from url candidate
 */
 export const setImportFromUrlCandidate = (value) => ({
  type: SET_IMPORT_FROM_URL_CANDIDATE,
  value
 });

/*
 * Reducers
 */
const STORIES_DEFAULT_STATE = {
  /**
   * Restory of all the stories stored in application's state
   * @type {object}
   */
  stories: {},
  /**
   * Restory of the id of the story being edited in editor
   * @type {string}
   */
  activeStoryId: undefined
};
/**
 * This redux reducer handles the modification of the data state for the stories stored in the application's state
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 */
function stories(state = STORIES_DEFAULT_STATE, action) {
  let newState;
  switch (action.type) {
    case APPLY_STORY_CANDIDATE_CONFIGURATION:
      if (state.activeStoryId) {
        // case update
        return {
          ...state,
          stories: {
            ...state.stories,
            [action.story.id]: {
              ...state.stories[action.story.id],
              ...action.story
            }
          },
          activeStoryId: action.story.id
        };
      }
      else {
        // case create
        return {
          ...state,
          stories: {
            ...state.stories,
            [action.story.id]: action.story
          },
          activeStoryId: action.story.id
        };
      }
    case SET_ACTIVE_STORY:
      return {
        ...state,
        activeStoryId: action.story.id
      };
    case UNSET_ACTIVE_STORY:
      return {
        ...state,
        activeStoryId: undefined
      };
    case CREATE_STORY:
      const id = action.id;
      let story = {
        ...action.story,
        id
      };
      return {
        ...state,
        stories: {
          ...state.stories,
          [id]: story
        }
      };
    case DELETE_STORY:
      newState = Object.assign({}, state);
      delete newState.stories[action.id];
      return newState;
    case UPDATE_STORY:
      return {
        ...state,
        stories: {
          ...state.stories,
          [action.id]: action.story
        }
      };
    case IMPORT_SUCCESS:
      story = action.data;
      return {
        ...state,
        stories: {
          ...state.stories,
          [story.id]: {
            ...story
          }
        }
      };
    case COPY_STORY:
      const original = action.story;
      const newId = uuid();
      const newStory = {
        ...original,
        id: newId,
        metadata: {
          ...original.metadata,
          title: original.metadata.title + ' - copy'
        }
      };
      return {
        ...state,
        stories: {
          ...state.stories,
          [newId]: newStory
        }
      };
    /*
     * ASSETS-RELATED
     */
    case UPDATE_ASSET:
    case CREATE_ASSET:
      const {
        storyId,
        id: assetId,
        asset
      } = action;
      return {
        ...state,
        stories: {
          ...state.stories,
          [storyId]: {
            ...state.stories[storyId],
            assets: {
              ...state.stories[storyId].assets,
              [assetId]: asset
            }
          }
        }
      };
    case UPDATE_STORY_CONTENT:
      return {
        ...state,
        stories: {
          ...state.stories,
          [action.id]: {
            ...state.stories[action.id],
            content: {...action.content}
          }
        }
      };
    case EMBED_ASSET:
      // building a rawContent representation of story content
      const prevRawContent = state.stories[action.id].content;
      const shadowEditor = EditorState.createWithContent(convertFromRaw(prevRawContent));
      // creating the entity
      const newEntityKey = Entity.create(
        action.metadata.type.toUpperCase(),
        'MUTABLE',
        {
          id: action.metadata.id
          // ...action.metadata
        }
      );
      // inserting the entity as an atomic block
      const EditorWithBlock = AtomicBlockUtils.insertAtomicBlock(
        EditorState.forceSelection(shadowEditor, action.atSelection),
        newEntityKey,
        ' '
      );
      // reconverting the content updated with the entity
      const newContent = convertToRaw(EditorWithBlock.getCurrentContent());
      // const newContent = convertToRaw(contentStateWithLink);
      return {
        ...state,
        stories: {
          ...state.stories,
          [action.id]: {
            ...state.stories[action.id],
            content: newContent
          }
        },
      };
    case UPDATE_STORY_METADATA_FIELD:
    return {
        ...state,
        stories: {
          ...state.stories,
          [action.id]: {
            ...state.stories[action.id],
            metadata: {
              ...state.stories[action.id].metadata,
              [action.key]: action.value
            }
          }
        }
      };
    case DELETE_ASSET:
      newState = {...state};
      delete newState.stories[action.storyId].assets[action.id];
      return newState;
    /*
     * EXPORT-RELATED
     */
    case EXPORT_TO_GIST + '_SUCCESS':
      return {
        ...state,
        stories: {
          ...state.stories,
          [state.activeStoryId]: {
            ...state.stories[state.activeStoryId],
            metadata: {
              ...state.stories[state.activeStoryId].metadata,
              gistUrl: action.result.gistUrl,
              gistId: action.result.gistId
            }
          }
        }
      };
    case EXPORT_TO_SERVER + '_SUCCESS':
      return {
        ...state,
        stories: {
          ...state.stories,
          [state.activeStoryId]: {
            ...state.stories[state.activeStoryId],
            metadata: {
              ...state.stories[state.activeStoryId].metadata,
              serverJSONUrl: serverUrl + '/stories/' + state.stories[state.activeStoryId].id,
              serverHTMLUrl: serverUrl + '/stories/' + state.stories[state.activeStoryId].id + '?format=html'
            }
          }
        }
      };
    default:
      return state;
  }
}

const STORIES_UI_DEFAULT_STATE = {
  /**
   * Restory of the id of the story being edited in editor
   * @type {string}
   */
  activeStoryId: undefined,
  /**
   * Restory of the id of the item being prompted to delete
   * @type {string}
   */
  promptedToDelete: undefined
};
/**
 * This redux reducer handles the modification of the ui state for stories management
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 */
function storiesUi(state = STORIES_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    case START_CANDIDATE_STORY_CONFIGURATION:
      return {
        activeStoryId: action.id
      };
    case CREATE_STORY:
      return {
        ...state,
        activeStoryId: action.setActive ? action.id : state.activeStoryId
      };
    case PROMPT_DELETE_STORY:
      return {
        ...state,
        promptedToDelete: action.id
      };
    case UNPROMPT_DELETE_STORY:
      return {
        ...state,
        promptedToDelete: undefined
      };
    case DELETE_STORY:
      return {
        ...state,
        promptedToDelete: undefined,
        activeStoryId: state.activeStoryId === action.id ? undefined : state.activeStoryId
      };
    default:
      return state;
  }
}


const STORY_IMPORT_DEFAULT_STATE = {
  /**
   * Restory of a story waiting to be imported or not
   * @type {object}
   */
  importCandidate: undefined,
  /**
   * Restory of the import state
   * @type {object}
   */
  importStatus: undefined,
  /**
   * Restory of the import error occured after an import failed
   * @type {string}
   */
  importError: undefined,
  /**
   * Restory of the content of import from url input
   * @type {string}
   */
  importFromUrlCandidate: ''
};
/**
 * This redux reducer handles the modifications related to importing stories in application's state
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 */
function storyImport(state = STORY_IMPORT_DEFAULT_STATE, action) {
  switch (action.type) {
    case IMPORT_RESET:
      return STORY_IMPORT_DEFAULT_STATE;
    case IMPORT_FAIL:
      return {
        ...state,
        importStatus: 'failure',
        importError: action.error
      };
    case IMPORT_SUCCESS:
      return {
        ...STORIES_DEFAULT_STATE,
        importStatus: 'success'
      };
    case IMPORT_OVERRIDE_PROMPT:
      return {
        ...state,
        importCandidate: action.candidate
      };
    case SET_IMPORT_FROM_URL_CANDIDATE:
      return {
        ...state,
        importFromUrlCandidate: action.value
      };
    default:
      return state;
  }
}
/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default persistentReducer(
  combineReducers({
      stories,
      storiesUi,
      storyImport
  }),
  'fonio-stories'
);

/*
 * Selectors
 */
const storiesList = state => Object.keys(state.stories.stories).map(key => state.stories.stories[key]);
const activeStory = state => state.stories.stories[state.stories.activeStoryId];
const activeStoryId = state => state.stories.activeStoryId;

const promptedToDeleteId = state => state.storiesUi.promptedToDelete;
const importStatus = state => state.storyImport.importStatus;
const importError = state => state.storyImport.importError;
const importCandidate = state => state.storyImport.importCandidate;
const importFromUrlCandidate = state => state.storyImport.importFromUrlCandidate;
/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  activeStory,
  activeStoryId,

  importCandidate,
  importError,
  importStatus,
  importFromUrlCandidate,

  storiesList,
  promptedToDeleteId,
});

