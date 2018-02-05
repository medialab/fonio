/**
 * This module exports logic-related elements for the management of (locally stored) fonio stories
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StoriesManager
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';
// import {persistentReducer} from 'redux-pouchdb';
import {v4 as uuid} from 'uuid';

import {loginToServer, resetPasswordServer} from '../../helpers/serverAuth';
import {fetchStoriesServer, createStoryServer, saveStoryServer, getStoryServer, getStoryBundleServer, deleteStoryServer} from '../../helpers/serverExporter';

import config from '../../../config';
const {timers} = config;

import {serverUrl} from '../../../secrets';

/*
 * Action names
 */
import {
  UNSET_ACTIVE_STORY
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
  UPDATE_RESOURCE,
  FETCH_RESOURCES,
  UPLOAD_RESOURCE_REMOTE,
  DELETE_RESOURCE_REMOTE,
} from '../ResourcesManager/duck';

import {
  CREATE_SECTION,
  UPDATE_SECTION,
  DELETE_SECTION,
  UPDATE_SECTIONS_ORDER,
} from '../SectionsManager/duck';

import {
  EXPORT_TO_GIST,
  EXPORT_STORY_BUNDLE
} from '../TakeAwayDialog/duck';

import {
  SET_STORY_CSS,
  SET_STORY_TEMPLATE,
  SET_STORY_SETTING_OPTION,
  FETCH_CITATION_STYLE,
  FETCH_CITATION_LOCALE,
} from '../StorySettingsManager/duck';

const FETCH_ALL_STORIES = '§Fonio/StoriesManager/FETCH_ALL_STORIES';
const FETCH_STORY = '§Fonio/StoriesManager/FETCH_STORY';
const SAVE_STORY = '§Fonio/StoriesManager/SAVE_STORY';
const CREATE_STORY = '§Fonio/StoriesManager/CREATE_STORY';
const DELETE_STORY = '§Fonio/StoriesManager/DELETE_STORY';
export const COPY_STORY = '§Fonio/StoriesManager/COPY_STORY';
const LOGIN_STORY = '§Fonio/StoriesManager/LOGIN_STORY';
const UPDATE_STORY = '§Fonio/StoriesManager/UPDATE_STORY';

const ENTER_STORY_PASSWORD = '§Fonio/StoriesManager/ENTER_STORY_PASSWORD';
const RESET_STORY_PASSWORD = '§Fonio/StoriesManager/RESET_STORY_PASSWORD';

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
 * fetch story list from server
 */
export const fetchAllStories = () => ({
  type: FETCH_ALL_STORIES,
  promise: () => {
  return new Promise((resolve, reject) => {
    return fetchStoriesServer()
      .then((response) => resolve(response))
      .catch((e) => reject(e));
   });
  }
});

/**
 * fetch story (without resource data) from server
 */
export const fetchStory = (id) => ({
  type: FETCH_STORY,
  promise: (dispatch) => {
  return new Promise((resolve, reject) => {
    return getStoryServer(id)
      .then((response) => {
        resolve(response);
        // remove message after a while
        setTimeout(() => dispatch({type: FETCH_STORY + '_RESET'}), timers.veryLong);

      })
      .catch((e) => {
        reject(e);
        // remove message after a while
        setTimeout(() => dispatch({type: FETCH_STORY + '_RESET'}), timers.veryLong);
      });
   });
  }
});

/**
 * Handles the "export to server" operation
 * @param {object} story - the story to export to the distant server
 * @return {object} action - the redux action to dispatch
 */
export const saveStory = (story, token) => ({
  type: SAVE_STORY,
  promise: (dispatch) => {
    return new Promise((resolve, reject) => {
      const newResources = {};
      if (story.resources) {
        Object.keys(story.resources)
        .map(key => story.resources[key].metadata)
        .forEach(metadata => {
          if (metadata.type === 'data-presentation' || metadata.type === 'table')
            newResources[metadata.id] = {metadata};
        });
      }
      const newStory = {
        ...story,
        resources: {
          ...story.resources,
          ...newResources
        }
      };
      return saveStoryServer(newStory, token)
        .then((d) => {
          resolve(d);
          // remove message after a while
          setTimeout(() => dispatch({type: SAVE_STORY + '_RESET'}), timers.veryLong);
        })
        .catch((e) => {
          reject(e);
          // remove message after a while
          setTimeout(() => dispatch({type: SAVE_STORY + '_RESET'}), timers.veryLong);
        });
    });
  }
});

/**
 * Handles the "set story password to server" operation
 * @param {object} story - the story credential to the distant server
 * @return {object} action - the redux action to dispatch
 */
export const resetStoryPassword = (id, password) => ({
  type: RESET_STORY_PASSWORD,
  id,
  promise: () => {
    return new Promise((resolve, reject) => {
      return resetPasswordServer(id, password)
        .then((token) => resolve(token))
        .catch((e) => reject(e));
    });
  }
});

/**
 * Creates a new story, possibly setting it as active
 * @param {string} id - the uuid of the story to create
 * @param {object} story - the data of the story to create
 * @return {object} action - the redux action to dispatch
 */

export const createStory = (story, password) => ({
  type: CREATE_STORY,
  story,
  promise: () => {
    const newResources = {};
    Object.keys(story.resources)
    .map(key => story.resources[key])
    .forEach(resource => {
      // add mimetype in resource.metadata
      if (resource.metadata.type === 'image') {
        const mime = resource.data.base64.substring('data:'.length, resource.data.base64.indexOf(';base64'));
        newResources[resource.metadata.id] = {
          ...resource,
          metadata: {
            ...resource.metadata,
            mime
          }
        };
      }
    });
    const newStory = {
      ...story,
      resources: {
        ...story.resources,
        ...newResources
      }
    };
    return new Promise((resolve, reject) => {
      return createStoryServer(newStory, password)
        .then(result => resolve(result))
        .catch(e => reject(e));
    });
  }
});

/**
 * Duplicates an existing story to create a new one
 * @param {object} story - the data of the story to copy
 * @return {object} action - the redux action to dispatch
 */

export const copyStory = (id) => ({
  type: COPY_STORY,
  promise: () => {
  return new Promise((resolve, reject) => {
    return getStoryBundleServer(id, 'json')
      .then((response) => {
        const newId = uuid();
        const newStory = {
        // breaking references with existing
        // resources/contextualizations/contents/... objects
        // to avoid side effects on their references
        // during a section of use
        // todo: better way to do that ?
        ...response,
          id: newId,
          metadata: {
            ...response.metadata,
            title: response.metadata.title + ' - copy'
          }
        };
        resolve(newStory);
      })
      .catch((e) => reject(e));
   });
  }
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
export const deleteStory = (id, token) => ({
  type: DELETE_STORY,
  id,
  promise: () => {
    return new Promise((resolve, reject) => {
      return deleteStoryServer(id, token)
        .then(() => resolve(id))
        .catch(e => reject(e));
    });
  }
});

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
// export const updateStory = (id) => ({
//   type: UPDATE_STORY,
//   promise: (dispatch) => {
//   return new Promise((resolve, reject) => {
//     return getStoryServer(id)
//       .then((response) => {
//         resolve(response);
//         setTimeout(() => dispatch({type: UPDATE_STORY + '_RESET'}), timers.veryLong);
//       })
//       .catch((e) => {
//         reject(e);
//         setTimeout(() => dispatch({type: UPDATE_STORY + '_RESET'}), timers.veryLong);
//       });
//    });
//   }
// });

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
 * Handles the "login story server if no token" operation
 * @param {object} story - the story credential to the distant server
 * @return {object} action - the redux action to dispatch
 */
export const loginStory = (id, password) => ({
  type: LOGIN_STORY,
  id,
  promise: () => {
    return new Promise((resolve, reject) => {
      return loginToServer(id, password)
        .then((token) => resolve(token))
        .catch((e) => reject(e));
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
   * Representation of the the story being edited in editor
   * @type {object}
   */
  activeStory: undefined
};

/**
 * This redux reducer handles the modification of the data state for the stories stored in the application's state
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the new state
 */
function stories(state = STORIES_DEFAULT_STATE, action) {
  let newState;
  switch (action.type) {
    case FETCH_ALL_STORIES + '_SUCCESS':
      return {
        ...state,
        stories: action.result
      };
    case FETCH_STORY + '_SUCCESS':
      return {
        ...state,
        activeStory: action.result
      };
    // a story is created
    case UNSET_ACTIVE_STORY:
      return {
        ...state,
        activeStory: undefined
      };
    case CREATE_STORY + '_SUCCESS':
      const {story, token} = action.result;
      localStorage.setItem(story.id, token);
      return {
        ...state,
        stories: {
          ...state.stories,
          [story.id]: story
        }
      };
    // a story is deleted
    case DELETE_STORY + '_SUCCESS':
      localStorage.removeItem(action.id);
      newState = Object.assign({}, state);
      delete newState.stories[action.id];
      return newState;
    // a story's content is replaced
    // todo: should we merge instead ?
    case UPDATE_STORY:
      return {
        ...state,
        activeStory: action.story
      };
    // case UPDATE_STORY + '_SUCCESS':
    //   return {
    //     ...state,
    //     activeStory: action.result
    //   };

    /*
     * SECTIONS-RELATED
     */
    // a section is created
    case CREATE_SECTION:
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          sections: {
            ...state.activeStory.sections,
            [action.sectionId]: action.section
          },
          sectionsOrder: action.appendToSectionsOrder ?
            [
              ...state.activeStory.sectionsOrder,
              action.sectionId
            ]
            : state.activeStory.sectionsOrder
        }
      };
    // a section is updated by merging its content
    // todo: should we merge data instead of replacing ?
    case UPDATE_SECTION:
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          sections: {
            ...state.activeStory.sections,
            [action.sectionId]: action.section
          }
        }
      };
    // a section is deleted
    case DELETE_SECTION:
      newState = {...state};
      delete newState.activeStory.sections[action.sectionId];
      if (newState.activeStory.sectionsOrder.indexOf(action.sectionId) > -1) {
        const index = newState.activeStory.sectionsOrder.indexOf(action.sectionId);
        newState.activeStory.sectionsOrder = [
          ...newState.activeStory.sectionsOrder.slice(0, index),
          ...newState.activeStory.sectionsOrder.slice(index + 1)
        ];
      }
      return newState;
    // sections summary order is changed
    case UPDATE_SECTIONS_ORDER:
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          sectionsOrder: [...action.sectionsOrder]
        }
      };
    /*
     * RESOURCES-RELATED
     */
    case FETCH_RESOURCES + '_SUCCESS':
      newState = {...state};
      const newResources = {};
      Object.keys(state.activeStory.resources)
        .map(key => state.activeStory.resources[key])
        .forEach(resource => {
          if (action.result[resource.metadata.id]) {
            newResources[resource.metadata.id] = {
              ...resource,
              data: action.result[resource.metadata.id]
            };
          }
          // generate data.url to link to image addr on server
          if (resource.metadata.type === 'image' && !resource.data) {
            const ext = resource.metadata.mime.split('/')[1];
            newResources[resource.metadata.id] = {
              ...resource,
              data: {
                ...resource.data,
                url: serverUrl + '/static/' + state.activeStory.id + '/resources/' + resource.metadata.id + '.' + ext
              }
            };
          }
        });
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          resources: {
            ...state.activeStory.resources,
            ...newResources
          }
        }
      };

    // CUD on resources
    case UPDATE_RESOURCE:
    case CREATE_RESOURCE:
    case UPLOAD_RESOURCE_REMOTE + '_SUCCESS':
      const {
        id: resourceId,
        storyId,
        resource
      } = action;
      let newResource = {...resource};
      if (resource.metadata.type === 'image') {
        const ext = resource.metadata.mime.split('/')[1];
        newResource = {
          ...resource,
          data: {
            url: serverUrl + '/static/' + storyId + '/resources/' + resourceId + '.' + ext
          }
        };
      }
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          resources: {
            ...state.activeStory.resources,
            [resourceId]: newResource
          }
        }
      };
    case DELETE_RESOURCE_REMOTE + '_SUCCESS':
    case DELETE_RESOURCE:
      newState = {...state};
      // delete newState.stories[action.storyId].resources[action.id];
      delete newState.activeStory.resources[action.id];
      // for now as the app does not allow to reuse the same contextualizer for several resources
      // we will delete associated contextualizers as well as associated contextualizations
      // (forseeing long edition sessions in which user create and delete a large number of contextualizations
      // if not doing so we would end up with a bunch of unused contextualizers in documents' data after a while)

      // we will store contextualizers id to delete here
      const contextualizersToDeleteIds = [];

      // we will store contextualizations id to delete here
      const contextualizationsToDeleteIds = [];
      // spot all objects to delete
      Object.keys(newState.activeStory.contextualizations)
        .forEach(contextualizationId => {
          if (newState.activeStory.contextualizations[contextualizationId].resourceId === action.id) {
            contextualizationsToDeleteIds.push(contextualizationId);
            contextualizersToDeleteIds.push(newState.activeStory.contextualizations[contextualizationId].contextualizerId);
          }
        });
      // proceed to deletions
      contextualizersToDeleteIds.forEach(contextualizerId => {
        delete newState.activeStory.contextualizers[contextualizerId];
      });
      contextualizationsToDeleteIds.forEach(contextualizationId => {
        delete newState.activeStory.contextualizations[contextualizationId];
      });

      return newState;

    /**
     * CONTEXTUALIZATION RELATED
     */
    // contextualizations CUD
    case UPDATE_CONTEXTUALIZATION:
    case CREATE_CONTEXTUALIZATION:
      const {
        contextualizationId,
        contextualization
      } = action;
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          contextualizations: {
            ...state.activeStory.contextualizations,
            [contextualizationId]: contextualization
          }
        }
      };
    case DELETE_CONTEXTUALIZATION:
      newState = {...state};
      delete newState.activeStory.contextualizations[action.contextualizationId];
      return newState;

    /**
     * CONTEXTUALIZER RELATED
     */
    // contextualizers CUD
    case UPDATE_CONTEXTUALIZER:
    case CREATE_CONTEXTUALIZER:
      // storyId = action.storyId;
      const {
        contextualizerId,
        contextualizer
      } = action;
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          contextualizers: {
            ...state.activeStory.contextualizers,
            [contextualizerId]: contextualizer
          }
        }
      };
    case DELETE_CONTEXTUALIZER:
      newState = {...state};
      delete newState.activeStory.contextualizers[action.id];
      return newState;

    /**
     * METADATA AND SETTINGS RELATED
     */
    case UPDATE_STORY_METADATA_FIELD:
      return {
          ...state,
          activeStory: {
            ...state.activeStory,
            metadata: {
              ...state.activeStory.metadata,
              [action.key]: action.value
            }
          }
        };
    // the custom css of a story is changed
    case SET_STORY_CSS :
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          settings: {
            ...state.activeStory.settings,
            css: action.css
          }
        }

      };
    // the template of a story is changed
    case SET_STORY_TEMPLATE :
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          settings: {
            ...state.activeStory.settings,
            template: action.template
          }
        }
      };
    // an settings' option is changed
    // (options depend on the choosen template)
    case SET_STORY_SETTING_OPTION:
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          settings: {
            ...state.activeStory.settings,
            options: {
              ...state.activeStory.settings.options,
              [action.field]: action.value,
            }
          }
        }
      };
    // fetching style to use for citations is loaded (citation style in xml/csl)
    case FETCH_CITATION_STYLE + '_SUCCESS':
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          settings: {
            ...state.activeStory.settings,
            citationStyle: action.result.citationStyle,
          }
        }
      };
    // fetching locale to use for citations is loaded (citation locale in xml)
    case FETCH_CITATION_LOCALE + '_SUCCESS':
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          settings: {
            ...state.activeStory.settings,
            citationLocale: action.result.citationLocale,
          }
        }
      };
    /*
     * EXPORT-RELATED
     */
    case EXPORT_STORY_BUNDLE + '_SUCCESS':
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          metadata: {
            ...state.activeStory.metadata,
            serverHTMLUrl: serverUrl + '/static/' + state.activeStory.id
          }
        }
      };
    case EXPORT_TO_GIST + '_SUCCESS':
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          metadata: {
            ...state.activeStory.metadata,
            // todo: should we wrap that in an object to be cleaner ?
            gistUrl: action.result.gistUrl,
            gistId: action.result.gistId
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
   * password for login story
   * @type {string}
   */
  password: '',

  /**
   * The status of fetch story on server (processing, success, error)
   * @type {string}
   */
  fetchStoryLogStatus: undefined,

  /**
   * The message of fetch story
   * @type {string}
   */
  fetchStoryLog: undefined,


  /**
   * The status of export story to server (processing, success, error)
   * @type {string}
   */
  saveStoryLogStatus: undefined,

  /**
   * The message of export story
   * @type {string}
   */
  saveStoryLog: undefined,

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
};

/**
 * This redux reducer handles the modification of the ui state for stories management
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the new state
 */
function storiesUi(state = STORIES_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    case UNSET_ACTIVE_STORY:
      return STORIES_UI_DEFAULT_STATE;
    case ENTER_STORY_PASSWORD:
      return {
        ...state,
        password: action.password
      };
    case FETCH_STORY + '_PENDING':
      return {
        ...state,
        fetchStoryLog: 'loading story',
        fetchStoryLogStatus: 'processing'
      };
    case FETCH_STORY + '_SUCCESS':
      return {
        ...state,
        fetchStoryLog: 'story is fetched',
        fetchStoryLogStatus: 'success'
      };
    case FETCH_STORY + '_FAIL':
      return {
        ...state,
        fetchStoryLog: 'story is not found',
        fetchStoryLogStatus: 'failure'
      };
    case SAVE_STORY + '_PENDING':
      return {
        ...state,
        saveStoryLog: 'saving story',
        saveStoryLogStatus: 'processing'
      };
    case SAVE_STORY + '_SUCCESS':
      return {
        ...state,
        saveStoryLog: 'story is saved on server',
        saveStoryLogStatus: 'success'
      };
    case SAVE_STORY + '_FAIL':
      return {
        ...state,
        saveStoryLog: 'story could not export to server',
        saveStoryLogStatus: 'failure'
      };
    case SAVE_STORY + '_RESET':
      return {
        ...state,
        saveStoryLog: undefined,
        saveStoryLogStatus: undefined
      };
    case UPDATE_STORY + '_RESET':
      return {
        ...state,
        updateStoryLog: undefined,
        updateStoryLogStatus: undefined
      };
    // a story is imported successfully
    // login story if no token
    case LOGIN_STORY + '_PENDING':
      return {
        ...state,
        loginStoryLog: 'login to story',
        loginStoryLogStatus: 'processing'
      };
    case LOGIN_STORY + '_SUCCESS':
      localStorage.setItem(action.id, action.result);
      return {
        ...state,
        password: undefined,
        storyPasswordModalOpen: false,
        loginStoryLog: 'password correct',
        loginStoryLogStatus: 'success'
      };
    case LOGIN_STORY + '_FAIL':
      localStorage.setItem(action.id, undefined);
      return {
        ...state,
        password: undefined,
        loginStoryLog: 'password incorrect',
        loginStoryLogStatus: 'failure'
      };
    case LOGIN_STORY + '_RESET':
      return {
        ...state,
        loginStoryLog: undefined,
        loginStoryLogStatus: undefined
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
  // stories: persistentReducer(stories, 'fonio-stories'),
  stories,
  storiesUi,
  // storiesUi: persistentReducer(storiesUi, 'fonio-stories-ui'),
  // we choose not to persist the story import ui state
  // as it is temporary in all cases
  storyImport,
});

/*
 * Selectors
 */
const storiesList = state => Object.keys(state.stories.stories).map(key => state.stories.stories[key]);
const activeStory = state => state.stories.activeStory;
const promptedToDeleteId = state => state.storiesUi.promptedToDelete;
const password = state => state.storiesUi.password;
const loginStoryLog = state => state.storiesUi.loginStoryLog;
const loginStoryLogStatus = state => state.storiesUi.loginStoryLogStatus;
const fetchStoryLog = state => state.storiesUi.fetchStoryLog;
const fetchStoryLogStatus = state => state.storiesUi.fetchStoryLogStatus;
const saveStoryLog = state => state.storiesUi.saveStoryLog;
const saveStoryLogStatus = state => state.storiesUi.saveStoryLogStatus;
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
  importCandidate,
  importError,
  importStatus,
  importFromUrlCandidate,
  password,
  fetchStoryLog,
  fetchStoryLogStatus,
  saveStoryLog,
  saveStoryLogStatus,
  loginStoryLog,
  loginStoryLogStatus,

  storiesList,
  promptedToDeleteId,
});

