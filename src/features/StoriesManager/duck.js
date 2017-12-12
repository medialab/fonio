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

import {registerToServer, loginToServer} from '../../helpers/serverAuth';
import {deleteStoryServer} from '../../helpers/serverExporter';

import {serverUrl} from '../../../secrets';
import config from '../../../config';
const {timers} = config;

/*
 * Action names
 */
import {
  APPLY_STORY_CANDIDATE_CONFIGURATION
} from '../GlobalUi/duck';

import {
  UPDATE_STORY_METADATA_FIELD,
  CREATE_CONTEXTUALIZER,
  UPDATE_CONTEXTUALIZER,
  DELETE_CONTEXTUALIZER,
  CREATE_CONTEXTUALIZATION,
  UPDATE_CONTEXTUALIZATION,
  DELETE_CONTEXTUALIZATION,
} from '../StoryEditor/duck';

import {
  CREATE_RESOURCE,
  DELETE_RESOURCE,
  UPDATE_RESOURCE
} from '../ResourcesManager/duck';

import {
  CREATE_SECTION,
  UPDATE_SECTION,
  DELETE_SECTION,
  UPDATE_SECTIONS_ORDER,
} from '../SectionsManager/duck';

import {
  EXPORT_TO_GIST,
  EXPORT_TO_SERVER
} from '../TakeAwayDialog/duck';

import {
  SET_STORY_CSS,
  SET_STORY_TEMPLATE,
  SET_STORY_SETTING_OPTION,
  FETCH_CITATION_STYLE,
  FETCH_CITATION_LOCALE,
} from '../StorySettingsManager/duck';

const CREATE_STORY = '§Fonio/StoriesManager/CREATE_STORY';
const DELETE_STORY = '§Fonio/StoriesManager/DELETE_STORY';
const UPDATE_STORY = '§Fonio/StoriesManager/UPDATE_STORY';
export const COPY_STORY = '§Fonio/StoriesManager/COPY_STORY';


const SAVE_STORY_PASSWORD = '§Fonio/StoriesManager/SAVE_STORY_PASSWORD';
const SAVE_STORY_PASSWORD_STATUS = '§Fonio/StoriesManager/SAVE_STORY_PASSWORD_STATUS';

const LOGIN_STORY = '§Fonio/StoriesManager/LOGIN_STORY';
const LOGIN_STORY_STATUS = '§Fonio/StoriesManager/LOGIN_STORY_STATUS';
const ENTER_STORY_PASSWORD = '§Fonio/StoriesManager/ENTER_STORY_PASSWORD';

const DELETE_STORY_STATUS = '§Fonio/StoriesManager/DELETE_STORY_STATUS';

const PROMPT_DELETE_STORY = '§Fonio/StoriesManager/PROMPT_DELETE_STORY';
const UNPROMPT_DELETE_STORY = '§Fonio/StoriesManager/UNPROMPT_DELETE_STORY';

const IMPORT_ABORD = '§Fonio/StoriesManager/IMPORT_ABORD';
const IMPORT_OVERRIDE_PROMPT = '§Fonio/StoriesManager/IMPORT_OVERRIDE_PROMPT';
const IMPORT_FAIL = '§Fonio/StoriesManager/IMPORT_FAIL';
export const IMPORT_SUCCESS = '§Fonio/StoriesManager/IMPORT_SUCCESS';
const IMPORT_RESET = '§Fonio/StoriesManager/IMPORT_RESET';
const SET_IMPORT_FROM_URL_CANDIDATE = '§Fonio/StoriesManager/SET_IMPORT_FROM_URL_CANDIDATE';

/*
 * Action creators
 */

/**
 * Creates a new story, possibly setting it as active
 * @param {string} id - the uuid of the story to create
 * @param {object} story - the data of the story to create
 * @param {boolean} setActive - whether to set the story as active (edited) story in app
 * @return {object} action - the redux action to dispatch
 */
export const createStory = (id, story, setActive = true) => ({
  type: CREATE_STORY,
  story,
  setActive,
  id
});

/**
 * Duplicates an existing story to create a new one
 * @param {object} story - the data of the story to copy
 * @return {object} action - the redux action to dispatch
 */
export const copyStory = (story) => ({
  type: COPY_STORY,
  story
});

/**
 * Prompts a story to be deleted ('are you sure ...')
 * @param {string} id - the uuid of the story to query for deletion
 * @return {object} action - the redux action to dispatch
 */
export const promptDeleteStory = (id) => ({
  type: PROMPT_DELETE_STORY,
  id
});

/**
 * Dismisses story deletion prompt
 * @return {object} action - the redux action to dispatch
 */
export const unpromptDeleteStory = () => ({
  type: UNPROMPT_DELETE_STORY
});

/**
 * Deletes a story
 * @param {string} id - the uuid of the story to delete
 * @return {object} action - the redux action to dispatch
 */
export const deleteStory = (id) => ({
  type: DELETE_STORY,
  id,
  promise: (dispatch) => {
  return new Promise((resolve, reject) => {
    return deleteStoryServer(id, dispatch, DELETE_STORY_STATUS)
      .then((token) => {
        sessionStorage.removeItem(id);
        resolve(token);
        // remove message after a while
        // setTimeout(() =>
        //   dispatch({
        //     type: LOGIN_STORY_STATUS,
        //     deleteStoryLog: undefined,
        //     deleteStoryStatus: undefined
        //   }), timers.medium);
      })
      .catch((e) => {
        reject(e);
        // remove message after a while
        // setTimeout(() =>
        //   dispatch({
        //     type: LOGIN_STORY_STATUS,
        //     deleteStoryLog: undefined,
        //     deleteStoryLogStatus: undefined
        //   }), timers.medium);
      });
   });
  }
});

/**
 * Deletes a story
 * @param {string} id - the uuid of the story to delete
 * @return {object} action - the redux action to dispatch
 */
// export const deleteStory = (id) => ({
//   type: DELETE_STORY,
//   id
// });

/**
 * Updates the content of an existing story by replacing its data with new one
 * @param {string} id - the uuid of the story to update
 * @param {object} story - the data of the story to update
 * @return {object} action - the redux action to dispatch
 */
export const updateStory = (id, story) => ({
  type: UPDATE_STORY,
  id,
  story
});

/**
 * Sets password for story login
 * @param {string} password
 * @return {object} action - the redux action to dispatch
 */
export const enterPassword = (password) => ({
  type: ENTER_STORY_PASSWORD,
  password
});

/**
 * Handles the "set story password to server" operation
 * @param {object} story - the story credential to the distant server
 * @return {object} action - the redux action to dispatch
 */
export const saveStoryPassword = (story) => ({
  type: SAVE_STORY_PASSWORD,
  promise: (dispatch) => {
    return new Promise((resolve, reject) => {
      return registerToServer(story, dispatch, SAVE_STORY_PASSWORD_STATUS)
        .then((token) => {
          sessionStorage.setItem(story.id, token);
          resolve(token);
          // // remove message after a while
          setTimeout(() =>
            dispatch({
              type: SAVE_STORY_PASSWORD_STATUS,
              savePasswordLog: undefined,
              savePasswordLogStatus: undefined
            }), timers.veryLong);
        })
        .catch((e) => {
          reject(e);
          // // remove message after a while
          setTimeout(() =>
            dispatch({
              type: SAVE_STORY_PASSWORD_STATUS,
              savePasswordLog: undefined,
              savePasswordLogStatus: undefined
            }), timers.veryLong);
        });
    });
  }
});

/**
 * Handles the "login story server if no token" operation
 * @param {object} story - the story credential to the distant server
 * @return {object} action - the redux action to dispatch
 */
export const loginStory = (story) => ({
  type: LOGIN_STORY,
  promise: (dispatch) => {
    return new Promise((resolve, reject) => {
      return loginToServer(story, dispatch, LOGIN_STORY_STATUS)
        .then((token) => {
          sessionStorage.setItem(story.id, token);
          resolve(token);
          // remove message after a while
          setTimeout(() =>
            dispatch({
              type: LOGIN_STORY_STATUS,
              loginStoryLog: undefined,
              loginStoryStatus: undefined
            }), timers.veryLong);
        })
        .catch((e) => {
          reject(e);
          // remove message after a while
          setTimeout(() =>
            dispatch({
              type: LOGIN_STORY_STATUS,
              loginStoryLog: undefined,
              loginStoryLogStatus: undefined
            }), timers.veryLong);
        });
    });
  }
});


/**
 * Reset the import process ui representation
 * @return {object} action - the redux action to dispatch
 */
export const importReset = () => ({
  type: IMPORT_RESET
});

/**
 * Dismiss the import process (e.g. in case of duplicate import)
 * @return {object} action - the redux action to dispatch
 */
export const abordImport = () => ({
  type: IMPORT_ABORD
});

/**
 * Displays an override warning when user tries to import
 * a story that has the same id as an existing one
 * @param {object} candidate - the data of the story waiting to be imported or not instead of existing one
 * @return {object} action - the redux action to dispatch
 */
export const promptOverrideImport = (candidate) => ({
  type: IMPORT_OVERRIDE_PROMPT,
  candidate
});

/**
 * Notifies ui that story import was a success
 * @param {object} data - the data of the imported story
 * @return {function} function to execute to handle the action
 */
export const importSuccess = (data) => (dispatch) => {
  dispatch({
    type: IMPORT_SUCCESS,
    data
  });
  // resets import state after a while
  setTimeout(() => dispatch(importReset()), timers.veryLong);
};

/**
 * Notifies ui that story import was a failure
 * @param {string} error - the error type for the import failure
 * @return {function} functoin to execute to handle the action
 */
export const importFail = (error) => (dispatch) => {
  dispatch({
    type: IMPORT_FAIL,
    error
  });
  // resets import state after a while
  setTimeout(() => dispatch(importReset()), timers.veryLong);
};

/**
 * Notifies the UI that user tries to import a story from an url
 * @param {string}  value - the new value to set for import from url candidate
 * @return {object} action - the redux action to dispatch
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
   * Representation of all the stories stored in application's state
   * @type {object}
   */
  stories: {},

  /**
   * Representation of the id of the story being edited in editor
   * @type {string}
   */
  // activeStoryId: undefined
};

/**
 * This redux reducer handles the modification of the data state for the stories stored in the application's state
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the new state
 */
function stories(state = STORIES_DEFAULT_STATE, action) {
  let newState;
  let storyId;
  switch (action.type) {
    // a story is updated from the changes
    // made to story candidate
    case APPLY_STORY_CANDIDATE_CONFIGURATION:
      return {
        ...state,
        stories: {
          ...state.stories,
          [action.story.id]: action.story
        }
      };
    // a story is created
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
    // a story is deleted
    case DELETE_STORY:
      newState = Object.assign({}, state);
      delete newState.stories[action.id];
      return newState;
    // a story's content is replaced
    // todo: should we merge instead ?
    case UPDATE_STORY:
      return {
        ...state,
        stories: {
          ...state.stories,
          [action.id]: action.story
        }
      };
    // a story is imported successfully
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
    // a story is duplicated to create a new one
    case COPY_STORY:
      // const original = action.story;
      // const newId = uuid();
      // const newStory = {
      //   // breaking references with existing
      //   // resources/contextualizations/contents/... objects
      //   // to avoid side effects on their references
      //   // during a section of use
      //   // todo: better way to do that ?
      //   ...JSON.parse(JSON.stringify(original)),
      //   id: newId,
      //   metadata: {
      //     ...original.metadata,
      //     title: original.metadata.title + ' - copy'
      //   }
      // };
      return {
        ...state,
        stories: {
          ...state.stories,
          [action.story.id]: action.story
        }
      };
    /*
     * SECTIONS-RELATED
     */
    // a section is created
    case CREATE_SECTION:
      return {
        ...state,
        stories: {
          ...state.stories,
          [action.storyId]: {
            ...state.stories[action.storyId],
            sections: {
              ...state.stories[action.storyId].sections,
              [action.sectionId]: action.section
            },
            sectionsOrder: action.appendToSectionsOrder ?
              [
                ...state.stories[action.storyId].sectionsOrder,
                action.sectionId
              ]
              : state.stories[action.storyId].sectionsOrder
          }
        }
      };
    // a section is updated by merging its content
    // todo: should we merge data instead of replacing ?
    case UPDATE_SECTION:
      return {
        ...state,
        stories: {
          ...state.stories,
          [action.storyId]: {
            ...state.stories[action.storyId],
            sections: {
              ...state.stories[action.storyId].sections,
              [action.sectionId]: action.section
            }
          }
        }
      };
    // a section is deleted
    case DELETE_SECTION:
      newState = {...state};
      delete newState.stories[action.storyId].sections[action.sectionId];
      // remove from sections order if applicable
      if (newState.stories[action.storyId].sectionsOrder.indexOf(action.sectionId) > -1) {
        const index = newState.stories[action.storyId].sectionsOrder.indexOf(action.sectionId);
        newState.stories[action.storyId].sectionsOrder = [
          ...newState.stories[action.storyId].sectionsOrder.slice(0, index),
          ...newState.stories[action.storyId].sectionsOrder.slice(index + 1)
        ];
      }
      return newState;
    // sections summary order is changed
    case UPDATE_SECTIONS_ORDER:
      return {
        ...state,
        stories: {
          ...state.stories,
          [action.storyId]: {
            ...state.stories[action.storyId],
            sectionsOrder: [...action.sectionsOrder]
          }
        }
      };
    /*
     * RESOURCES-RELATED
     */
    // CUD on resources
    case UPDATE_RESOURCE:
    case CREATE_RESOURCE:
      storyId = action.storyId;
      const {
        id: resourceId,
        resource
      } = action;
      return {
        ...state,
        stories: {
          ...state.stories,
          [storyId]: {
            ...state.stories[storyId],
            resources: {
              ...state.stories[storyId].resources,
              [resourceId]: resource
            }
          }
        }
      };
    case DELETE_RESOURCE:
      newState = {...state};
      delete newState.stories[action.storyId].resources[action.id];
      // for now as the app does not allow to reuse the same contextualizer for several resources
      // we will delete associated contextualizers as well as associated contextualizations
      // (forseeing long edition sessions in which user create and delete a large number of contextualizations
      // if not doing so we would end up with a bunch of unused contextualizers in documents' data after a while)

      // we will store contextualizers id to delete here
      const contextualizersToDeleteIds = [];

      // we will store contextualizations id to delete here
      const contextualizationsToDeleteIds = [];
      // spot all objects to delete
      Object.keys(newState.stories[action.storyId].contextualizations)
        .forEach(contextualizationId => {
          if (newState.stories[action.storyId].contextualizations[contextualizationId].resourceId === action.id) {
            contextualizationsToDeleteIds.push(contextualizationId);
            contextualizersToDeleteIds.push(newState.stories[action.storyId].contextualizations[contextualizationId].contextualizerId);
          }
        });
      // proceed to deletions
      contextualizersToDeleteIds.forEach(contextualizerId => {
        delete newState.stories[action.storyId].contextualizers[contextualizerId];
      });
      contextualizationsToDeleteIds.forEach(contextualizationId => {
        delete newState.stories[action.storyId].contextualizations[contextualizationId];
      });
      return newState;

    /**
     * CONTEXTUALIZATION RELATED
     */
    // contextualizations CUD
    case UPDATE_CONTEXTUALIZATION:
    case CREATE_CONTEXTUALIZATION:
      storyId = action.storyId;
      const {
        contextualizationId,
        contextualization
      } = action;
      return {
        ...state,
        stories: {
          ...state.stories,
          [storyId]: {
            ...state.stories[storyId],
            contextualizations: {
              ...state.stories[storyId].contextualizations,
              [contextualizationId]: contextualization
            }
          }
        }
      };
    case DELETE_CONTEXTUALIZATION:
      newState = {...state};
      delete newState.stories[action.storyId].contextualizations[action.contextualizationId];
      return newState;

    /**
     * CONTEXTUALIZER RELATED
     */
    // contextualizers CUD
    case UPDATE_CONTEXTUALIZER:
    case CREATE_CONTEXTUALIZER:
      storyId = action.storyId;
      const {
        contextualizerId,
        contextualizer
      } = action;
      return {
        ...state,
        stories: {
          ...state.stories,
          [storyId]: {
            ...state.stories[storyId],
            contextualizers: {
              ...state.stories[storyId].contextualizers,
              [contextualizerId]: contextualizer
            }
          }
        }
      };
    case DELETE_CONTEXTUALIZER:
      newState = {...state};
      delete newState.stories[action.storyId].contextualizers[action.id];
      return newState;

    /**
     * METADATA AND SETTINGS RELATED
     */
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
    // the custom css of a story is changed
    case SET_STORY_CSS :
      return {
        ...state,
          stories: {
            ...state.stories,
            [action.id]: {
              ...state.stories[action.id],
              settings: {
                ...state.stories[action.id].settings,
                css: action.css
              }
            }
          }
      };
    // the template of a story is changed
    case SET_STORY_TEMPLATE :
      return {
        ...state,
          stories: {
            ...state.stories,
            [action.id]: {
              ...state.stories[action.id],
              settings: {
                ...state.stories[action.id].settings,
                template: action.template
              }
            }
          }
      };
    // an settings' option is changed
    // (options depend on the choosen template)
    case SET_STORY_SETTING_OPTION:
      return {
        ...state,
          stories: {
            ...state.stories,
            [action.id]: {
              ...state.stories[action.id],
              settings: {
                ...state.stories[action.id].settings,
                options: {
                  ...state.stories[action.id].settings.options,
                  [action.field]: action.value,
                }
              }
            }
          }
      };
    // fetching style to use for citations is loaded (citation style in xml/csl)
    case FETCH_CITATION_STYLE + '_SUCCESS':
      return {
        ...state,
          stories: {
            ...state.stories,
            [action.result.storyId]: {
              ...state.stories[action.result.storyId],
              settings: {
                ...state.stories[action.result.storyId].settings,
                citationStyle: action.result.citationStyle,
              }
            }
          }
      };
    // fetching locale to use for citations is loaded (citation locale in xml)
    case FETCH_CITATION_LOCALE + '_SUCCESS':
      return {
        ...state,
          stories: {
            ...state.stories,
            [action.result.storyId]: {
              ...state.stories[action.result.storyId],
              settings: {
                ...state.stories[action.result.storyId].settings,
                citationLocale: action.result.citationLocale,
              }
            }
          }
      };
    /*
     * EXPORT-RELATED
     */
    case EXPORT_TO_GIST + '_SUCCESS':
      return {
        ...state,
        stories: {
          ...state.stories,
          [action.result.storyId]: {
            ...state.stories[action.result.storyId],
            metadata: {
              ...state.stories[action.result.storyId].metadata,
              // todo: should we wrap that in an object to be cleaner ?
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
          [action.result.storyId]: {
            ...state.stories[action.result.storyId],
            metadata: {
              ...state.stories[action.result.storyId].metadata,
              // todo: should we wrap that in an object to be cleaner ?
              serverJSONUrl: serverUrl + '/stories/' + action.result.storyId,
              serverHTMLUrl: serverUrl + '/stories/' + action.result.storyId + '?format=html'
            }
          }
        }
      };
    default:
      return state;
  }
}


/**
 * Default state for the ui of the stories manager view (home)
 */
const STORIES_UI_DEFAULT_STATE = {
  /**
   * Representation of the id of the item being prompted to delete
   * @type {string}
   */
  promptedToDelete: undefined,

  /**
   * The status of set password to server (processing, success, error)
   * @type {string}
   */
  saveStoryPasswordLogStatus: undefined,

  /**
   * The message of set password to server
   * @type {string}
   */
  saveStoryPasswordLog: undefined,

  /**
   * password for login story
   * @type {string}
   */
  password: undefined,

  /**
   * The status of login story with password on server (processing, success, error)
   * @type {string}
   */
  loginStoryLogStatus: undefined,

  /**
   * The message of login story
   * @type {string}
   */
  loginStoryLog: undefined,
  /**
   * The status of delete story with token on server (processing, success, error)
   * @type {string}
   */
  deleteStoryLogStatus: undefined,

  /**
   * The message of delete story
   * @type {string}
   */
  deleteStoryLog: undefined,
};

/**
 * This redux reducer handles the modification of the ui state for stories management
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the new state
 */
function storiesUi(state = STORIES_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    case ENTER_STORY_PASSWORD:
      return {
        ...state,
        password: action.password
      };
    // save story password
    case SAVE_STORY_PASSWORD_STATUS:
      return {
        ...state,
        saveStoryPasswordLog: action.log,
        saveStoryPasswordLogStatus: action.status
      };
    case SAVE_STORY_PASSWORD + '_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        saveStoryPasswordLog: 'password saved',
        saveStoryPasswordLogStatus: 'success'
      };
    case SAVE_STORY_PASSWORD + '_FAIL':
      return {
        ...state,
        isAuthenticated: false,
        saveStoryPasswordLog: 'password not saved',
        saveStoryPasswordLogStatus: 'failure'
      };
    // login story if no token
    case LOGIN_STORY_STATUS:
      return {
        ...state,
        loginStoryLog: action.log,
        loginStoryLogStatus: action.status
      };
    case LOGIN_STORY + '_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        password: undefined,
        storyPasswordModalOpen: false,
        loginStoryLog: 'password correct',
        loginStoryLogStatus: 'success'
      };
    case LOGIN_STORY + '_FAIL':
      return {
        ...state,
        isAuthenticated: false,
        loginStoryLog: 'password not correct',
        loginStoryLogStatus: 'failure'
      };
    // a story is imported successfully
    case PROMPT_DELETE_STORY:
      return {
        ...state,
        promptedToDelete: action.id
      };
    // deletion is dismissed/aborted
    case UNPROMPT_DELETE_STORY:
      return {
        ...state,
        promptedToDelete: undefined
      };
    // a story is deleted
    case DELETE_STORY:
      return {
        ...state,
        promptedToDelete: undefined,
      };
    default:
      return state;
  }
}


/**
 * Default state of the representation of the story import process
 */
const STORY_IMPORT_DEFAULT_STATE = {

  /**
   * Representation of a story waiting to be imported or not
   * @type {object}
   */
  importCandidate: undefined,

  /**
   * Representation of the import state
   * @type {object}
   */
  importStatus: undefined,

  /**
   * Representation of the import error occured after an import failed
   * @type {string}
   */
  importError: undefined,

  /**
   * Representation of the content of import from url input
   * @type {string}
   */
  importFromUrlCandidate: ''
};

/**
 * This redux reducer handles the modifications related to importing stories in application's state
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the new state
 */
function storyImport(state = STORY_IMPORT_DEFAULT_STATE, action) {
  switch (action.type) {
    case IMPORT_RESET:
      return STORY_IMPORT_DEFAULT_STATE;
    // import fails
    case IMPORT_FAIL:
      return {
        ...state,
        importStatus: 'failure',
        importError: action.error
      };
    // import succeeds
    case IMPORT_SUCCESS:
      return {
        ...STORIES_DEFAULT_STATE,
        importStatus: 'success'
      };
    // an existing story is duplicated
    // with the story the user tries toimport
    case IMPORT_OVERRIDE_PROMPT:
      return {
        ...state,
        importCandidate: action.candidate
      };
    // user tries to import a story from an url
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
export default combineReducers({
  stories: persistentReducer(stories, 'fonio-stories'),
  storiesUi: persistentReducer(storiesUi, 'fonio-stories-ui'),
  // we choose not to persist the story import ui state
  // as it is temporary in all cases
  storyImport,
});

/*
 * Selectors
 */
const storiesList = state => Object.keys(state.stories.stories).map(key => state.stories.stories[key]);
const allStories = state => state.stories.stories;
const promptedToDeleteId = state => state.storiesUi.promptedToDelete;
const password = state => state.storiesUi.password;
const saveStoryPasswordLog = state => state.storiesUi.saveStoryPasswordLog;
const saveStoryPasswordLogStatus = state => state.storiesUi.saveStoryPasswordLogStatus;
const loginStoryLog = state => state.storiesUi.loginStoryLog;
const loginStoryLogStatus = state => state.storiesUi.loginStoryLogStatus;


const importStatus = state => state.storyImport.importStatus;
const importError = state => state.storyImport.importError;
const importCandidate = state => state.storyImport.importCandidate;
const importFromUrlCandidate = state => state.storyImport.importFromUrlCandidate;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  allStories,
  importCandidate,
  importError,
  importStatus,
  importFromUrlCandidate,
  password,
  saveStoryPasswordLog,
  saveStoryPasswordLogStatus,
  loginStoryLog,
  loginStoryLogStatus,

  storiesList,
  promptedToDeleteId,
});

