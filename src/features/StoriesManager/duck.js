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

import debounce from 'debounce-promise';


import {loginToServer, resetPasswordServer} from '../../helpers/serverAuth';
import {
  fetchStoriesServer,
  createStoryServer,
  saveStoryServer,
  getStoryServer,
  getStoryBundleServer,
  deleteStoryServer
} from '../../helpers/serverExporter';

import config from '../../../config';
const {timers, savingDelayMs} = config;

import {serverUrl} from '../../../secrets';


const debouncedSaveStoryServer = debounce(saveStoryServer, savingDelayMs);

/*
 * Action names
 */
import {
  UNSET_ACTIVE_STORY,
  APPLY_STORY_CANDIDATE_CONFIGURATION,
  CLOSE_STORY_CANDIDATE_MODAL,
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
  SET_STORY_CSS_FROM_USER,
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

const OPEN_LOGIN_MODAL = '$Fonio/StoriesManager/OPEN_LOGIN_MODAL';
const CLOSE_LOGIN_MODAL = '$Fonio/StoriesManager/CLOSE_LOGIN_MODAL';
const OPEN_RESET_PASSWORD_MODAL = '$Fonio/StoriesManager/OPEN_RESET_PASSWORD_MODAL';
const CLOSE_RESET_PASSWORD_MODAL = '$Fonio/StoriesManager/CLOSE_RESET_PASSWORD_MODAL';
const RESET_STORY_PASSWORD = '§Fonio/StoriesManager/RESET_STORY_PASSWORD';

const PROMPT_DELETE_STORY = '§Fonio/StoriesManager/PROMPT_DELETE_STORY';
const UNPROMPT_DELETE_STORY = '§Fonio/StoriesManager/UNPROMPT_DELETE_STORY';

const IMPORT_ABORD = '§Fonio/StoriesManager/IMPORT_ABORD';
const IMPORT_OVERRIDE_PROMPT = '§Fonio/StoriesManager/IMPORT_OVERRIDE_PROMPT';
const IMPORT_FAIL = '§Fonio/StoriesManager/IMPORT_FAIL';
export const IMPORT_SUCCESS = '§Fonio/StoriesManager/IMPORT_SUCCESS';
const IMPORT_RESET = '§Fonio/StoriesManager/IMPORT_RESET';

/*
 * Action creators
 */

/**
 * fetch story list from server
 */
export const fetchAllStories = () => ({
  type: FETCH_ALL_STORIES,
  promise: () => {
    return fetchStoriesServer();
  }
});

/**
 * fetch story (without resource data) from server
 */
export const fetchStory = (id) => ({
  type: FETCH_STORY,
  id,
  promise: () => {
    return getStoryServer(id);
  }
});

/**
 * TODO: implement auto save story on server
 * save story on server
 * @param {object} story - the story to export to the distant server
 * @param {string} token
 * @return {object} action - the redux action to dispatch
 */
export const saveStory = (story, token) => ({
  type: SAVE_STORY,
  id: story.id,
  promise: () => {
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
    return debouncedSaveStoryServer(newStory, token);
  }
});

/**
 * Handles the "reset story password to server" operation
 * @param  id - the story id
 * @param {string} password - story password
 * @return {object} action - the redux action to dispatch
 */
export const resetStoryPassword = (id, oldPassword, newPassword) => ({
  type: RESET_STORY_PASSWORD,
  id,
  promise: () => {
    return resetPasswordServer(id, oldPassword, newPassword);
  }
});

/**
 * Creates a new story on server
 * @param {object} story - the data of the story to create
 * @param {string} password - story password
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
    return createStoryServer(newStory, password);
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
 * Delete a story on server
 * @param {string} id - the uuid of the story to delete
 * @param {string} token
 * @return {object} action - the redux action to dispatch
 */
export const deleteStory = (id, token) => ({
  type: DELETE_STORY,
  id,
  promise: () => {
    return deleteStoryServer(id, token);
  }
});

/**
 * Updates the content of an existing story by replacing its data with new one
 * @param {string} id - the uuid of the story to update
 * @param {object} story - the data of the story to update
 * @return {object} action - the redux action to dispatch
 */

/**
 * TODO: implement auto update story from server
 */
export const updateStory = (id, story) => ({
  type: UPDATE_STORY,
  id,
  story
});


/**
 * Opens the password modal view
 * @return {object} action - the redux action to dispatch
 */
export const openLoginModal = (id) => ({
  type: OPEN_LOGIN_MODAL,
  id
});

/**
 * close the password modal view
 * @return {object} action - the redux action to dispatch
 */
export const closeLoginModal = () => ({
  type: CLOSE_LOGIN_MODAL
});

/**
 * Opens the password modal view
 * @return {object} action - the redux action to dispatch
 */
export const openResetPasswordModal = (id) => ({
  type: OPEN_RESET_PASSWORD_MODAL,
  id
});


/**
 * close the password modal view
 * @return {object} action - the redux action to dispatch
 */
export const closeResetPasswordModal = () => ({
  type: CLOSE_RESET_PASSWORD_MODAL
});

/**
 * login story when token is not valid
 * @param {object} story - the story credential to the distant server
 * @return {object} action - the redux action to dispatch
 */
export const loginStory = (id, password) => ({
  type: LOGIN_STORY,
  id,
  promise: () => {
    return loginToServer(id, password);
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
  let story;
  let contextualizations;
  let contextualizers;
  switch (action.type) {
    case UNSET_ACTIVE_STORY:
      return {
        ...state,
        activeStory: undefined
      };
    case FETCH_ALL_STORIES + '_SUCCESS':
      return {
        ...state,
        stories: action.result
      };
    case FETCH_STORY + '_SUCCESS':
      story = action.result;
      const newResources = {};
      Object.keys(story.resources)
        .map(key => story.resources[key])
        .forEach(resource => {
          const {type} = resource.metadata;
          // generate data.url to link to image addr on server
          if ((type === 'image' || type === 'table' || type === 'data-presentation') && !resource.data) {
            const ext = type === 'image' ? resource.metadata.mime.split('/')[1] : 'json';
            newResources[resource.metadata.id] = {
              ...resource,
              data: {
                ...resource.data,
                url: serverUrl + '/static/' + story.id + '/resources/' + resource.metadata.id + '.' + ext
              }
            };
          }
        });
      return {
        ...state,
        activeStory: {
          ...story,
          resources: {
            ...story.resources,
            ...newResources
          }
        }
      };
    case CREATE_STORY + '_SUCCESS':
      story = action.result.story;
      return {
        ...state,
        stories: {
          ...state.stories,
          [story.id]: story
        }
      };
    case APPLY_STORY_CANDIDATE_CONFIGURATION:
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          ...action.story
        }
      };
    // a story is deleted
    case DELETE_STORY + '_SUCCESS':
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
      if (state.activeStory) {
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
      }
      return state;
    // a section is deleted
    case DELETE_SECTION:
      const sections = {...state.activeStory.sections};
      let sectionsOrder = {...state.activeStory.sectionsOrder};
      delete sections[action.sectionId];
      if (state.activeStory.sectionsOrder.indexOf(action.sectionId) > -1) {
        const index = state.activeStory.sectionsOrder.indexOf(action.sectionId);
        sectionsOrder = [
          ...state.activeStory.sectionsOrder.slice(0, index),
          ...state.activeStory.sectionsOrder.slice(index + 1)
        ];
      }
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          sections,
          sectionsOrder
        }
      };
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
      const {type} = resource.metadata;
      if (type === 'image' || type === 'table' || type === 'data-presentation') {
        const ext = type === 'image' ? resource.metadata.mime.split('/')[1] : 'json';
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
      const resources = {...state.activeStory.resources};
      contextualizations = {...state.activeStory.contextualizations};
      contextualizers = {...state.activeStory.contextualizers};
      delete resources[action.id];
      // for now as the app does not allow to reuse the same contextualizer for several resources
      // we will delete associated contextualizers as well as associated contextualizations
      // (forseeing long edition sessions in which user create and delete a large number of contextualizations
      // if not doing so we would end up with a bunch of unused contextualizers in documents' data after a while)

      // we will store contextualizers id to delete here
      const contextualizersToDeleteIds = [];

      // we will store contextualizations id to delete here
      const contextualizationsToDeleteIds = [];
      // spot all objects to delete
      Object.keys(contextualizations)
        .forEach(contextualizationId => {
          if (contextualizations[contextualizationId].resourceId === action.id) {
            contextualizationsToDeleteIds.push(contextualizationId);
            contextualizersToDeleteIds.push(contextualizations[contextualizationId].contextualizerId);
          }
        });
      // proceed to deletions
      contextualizersToDeleteIds.forEach(contextualizerId => {
        delete contextualizers[contextualizerId];
      });
      contextualizationsToDeleteIds.forEach(contextualizationId => {
        delete contextualizations[contextualizationId];
      });

      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          resources,
          contextualizers,
          contextualizations
        }
      };

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
      contextualizations = {...state.activeStory.contextualizations};
      delete contextualizations[action.contextualizationId];
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          contextualizations
        }
      };

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
      contextualizers = {...state.activeStory.contextualizers};
      delete contextualizers[action.contextualizerId];
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          contextualizers
        }
      };

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
    // the custom css as seen by user of a story is changed
    case SET_STORY_CSS_FROM_USER :
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          settings: {
            ...state.activeStory.settings,
            cssFromUser: action.css
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
 * Default state for the auth of the story
 */
const STORY_AUTH_DEFAULT_STATE = {
  /**
   * Represents whether login modal is open
   * @type {boolean}
   */
  loginModalOpen: false,

  /**
   * Represents whether reset password modal is open
   * @type {boolean}
   */
  resetPasswordModalOpen: false,

  /**
   * storyId that asked for reset password
   * @type {string}
   */
  resetPasswordStoryId: undefined,

  /**
   * unauth story id
   * @type {string}
   */
  notAuthStoryId: undefined
};

/**
 * This redux reducer handles the modification of the auth state for story management
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the new state
 */
function storyAuth(state = STORY_AUTH_DEFAULT_STATE, action) {
  switch (action.type) {
    case OPEN_LOGIN_MODAL:
      return {
        ...state,
        notAuthStoryId: action.id,
        loginModalOpen: true
      };
    case CLOSE_LOGIN_MODAL:
      return {
        ...state,
        password: undefined,
        notAuthStoryId: undefined,
        loginModalOpen: false
      };
    case OPEN_RESET_PASSWORD_MODAL:
      return {
        ...state,
        resetPasswordStoryId: action.id,
        resetPasswordModalOpen: true
      };
    case CLOSE_RESET_PASSWORD_MODAL:
      return {
        ...state,
        resetPasswordStoryId: undefined,
        resetPasswordModalOpen: false
      };
    case CREATE_STORY + '_SUCCESS':
      const {story, token} = action.result;
      localStorage.setItem(story.id, token);
      return state;
    case LOGIN_STORY + '_SUCCESS':
      localStorage.setItem(action.id, action.result);
      return {
        ...state,
        notAuthStoryId: undefined,
        loginModalOpen: false
      };
    case RESET_STORY_PASSWORD + '_SUCCESS':
      localStorage.setItem(action.id, action.result);
      return {
        ...state,
        resetPasswordStoryId: undefined,
        resetPasswordModalOpen: false
      };
    case DELETE_STORY + '_SUCCESS':
      localStorage.removeItem(action.id);
      return state;
    case SAVE_STORY + '_FAIL':
    case DELETE_STORY + '_FAIL':
    case LOGIN_STORY + '_FAIL':
    case UPLOAD_RESOURCE_REMOTE + '_FAIL':
    case DELETE_RESOURCE_REMOTE + '_FAIL':
      if (action.error.response && action.error.response.text) {
        const error = JSON.parse(action.error.response.text);
        if (error.auth === false) {
          const storyId = (action.type === UPLOAD_RESOURCE_REMOTE + '_FAIL' || action.type === DELETE_RESOURCE_REMOTE + '_FAIL') ? action.storyId : action.id;
          localStorage.removeItem(storyId);
          return {
            ...state,
            notAuthStoryId: storyId,
            loginModalOpen: true
          };
        }
        else return state;
      }
      else
        return state;
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
   * story server api message
   * @type {string}
   */
  storyToasterLog: undefined,

  /**
   * story server api status
   * @type {string}
   */
  storyToasterLogStatus: undefined,

  /**
   * login story api message
   * @type {string}
   */
  loginStoryLog: undefined,

  /**
   * login story api status
   * @type {string}
   */
  loginStoryLogStatus: undefined,

  /**
   * reset story password api message
   * @type {string}
   */
  resetStoryPasswordLog: undefined,

  /**
   * reset story password api status
   * @type {string}
   */
  resetStoryPasswordLogStatus: undefined,

  /**
   * create story api message
   * @type {string}
   */
  createStoryLog: undefined,

  /**
   * create story api status
   * @type {string}
   */
  createStoryLogStatus: undefined,
};

/**
 * This redux reducer handles the modification of the ui state for stories management
 * @param {object} state - the state given to the reducer
 * @param {object} action - the action to use to produce new state
 * @return {object} newState - the new state
 */
function storiesUi(state = STORIES_UI_DEFAULT_STATE, action) {
  let actionString;
  switch (action.type) {
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
    // story api actions
    case SAVE_STORY + '_PENDING':
      actionString = action.type.split('/')[2].toLowerCase().split('_').join('-');
      return {
        ...state,
        storyToasterLog: actionString + '-log',
        storyToasterLogStatus: 'processing'
      };
    case SAVE_STORY + '_SUCCESS':
      actionString = action.type.split('/')[2].toLowerCase().split('_').join('-');
      return {
        ...state,
        storyToasterLog: actionString + '-log',
        storyToasterLogStatus: 'success'
      };
    case FETCH_ALL_STORIES + '_RESET':
    case FETCH_STORY + '_RESET':
    case SAVE_STORY + '_RESET':
    case DELETE_STORY + '_RESET':
    case DELETE_RESOURCE_REMOTE + '_RESET':
      return {
        ...state,
        storyToasterLog: undefined,
        storyToasterLogStatus: undefined
      };
    case FETCH_ALL_STORIES + '_FAIL':
    case FETCH_STORY + '_FAIL':
    case SAVE_STORY + '_FAIL':
    case DELETE_STORY + '_FAIL':
    case DELETE_RESOURCE_REMOTE + '_FAIL':
      actionString = action.type.split('/')[2].toLowerCase().split('_').join('-');
      return {
        ...state,
        storyToasterLog: actionString + '-log',
        storyToasterLogStatus: 'failure'
      };
    case LOGIN_STORY + '_PENDING':
      return {
        ...state,
        loginStoryLog: 'login-story-pending-log',
        loginStoryLogStatus: 'processing'
      };
    case LOGIN_STORY + '_SUCCESS':
      return {
        ...state,
        loginStoryLog: 'login-story-success-log',
        loginStoryLogStatus: 'success'
      };
    case LOGIN_STORY + '_FAIL':
      return {
        ...state,
        loginStoryLog: 'login-story-fail-log',
        loginStoryLogStatus: 'failure'
      };
    case LOGIN_STORY + '_RESET':
    case CLOSE_LOGIN_MODAL:
      return {
        ...state,
        loginStoryLog: undefined,
        loginStoryLogStatus: undefined
      };
    case RESET_STORY_PASSWORD + '_PENDING':
      return {
        ...state,
        resetStoryPasswordLog: 'reset-password-pending-log',
        resetStoryPasswordLogStatus: 'processing'
      };
    case RESET_STORY_PASSWORD + '_SUCCESS':
      return {
        ...state,
        resetStoryPasswordLog: 'reset-password-success-log',
        resetStoryPasswordLogStatus: 'success'
      };
    case RESET_STORY_PASSWORD + '_FAIL':
      return {
        ...state,
        resetStoryPasswordLog: 'reset-password-fail-log',
        resetStoryPasswordLogStatus: 'failure'
      };
    case RESET_STORY_PASSWORD + '_RESET':
    case CLOSE_RESET_PASSWORD_MODAL:
      return {
        ...state,
        resetStoryPasswordLog: undefined,
        resetStoryPasswordLogStatus: undefined
      };
    case CREATE_STORY + '_PENDING':
      return {
        ...state,
        createStoryLog: 'create-story-pending-log',
        createStoryLogStatus: 'processing'
      };
    case CREATE_STORY + '_SUCCESS':
      return {
        ...state,
        createStoryLog: 'create-story-success-log',
        createStoryLogStatus: 'success'
      };
    case CREATE_STORY + '_FAIL':
      return {
        ...state,
        createStoryLog: 'create-story-fail-log',
        createStoryLogStatus: 'failure'
      };
    case CREATE_STORY + '_RESET':
    case CLOSE_STORY_CANDIDATE_MODAL:
      return {
        ...state,
        createStoryLog: undefined,
        createStoryLogStatus: undefined
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
    default:
      return state;
  }
}


/**
 * The module exports a reducer (not persist to pouchdb)
 */
export default combineReducers({
  stories,
  storiesUi,
  storyAuth,
  storyImport,
});

/*
 * Selectors
 */
const storiesList = state => Object.keys(state.stories.stories).map(key => state.stories.stories[key]);
const activeStory = state => state.stories.activeStory;
const activeStoryId = state => state.stories.activeStory && state.stories.activeStory.id;
const promptedToDeleteId = state => state.storiesUi.promptedToDelete;
const importStatus = state => state.storyImport.importStatus;
const importError = state => state.storyImport.importError;
const importCandidate = state => state.storyImport.importCandidate;
const importFromUrlCandidate = state => state.storyImport.importFromUrlCandidate;

const isLoginModalOpen = state => state.storyAuth.loginModalOpen;
const isResetPasswordModalOpen = state => state.storyAuth.resetPasswordModalOpen;
const resetPasswordStoryId = state => state.storyAuth.resetPasswordStoryId;
const notAuthStoryId = state => state.storyAuth.notAuthStoryId;

const storyToasterLog = state => state.storiesUi.storyToasterLog;
const storyToasterLogStatus = state => state.storiesUi.storyToasterLogStatus;
const resetStoryPasswordLog = state => state.storiesUi.resetStoryPasswordLog;
const resetStoryPasswordLogStatus = state => state.storiesUi.resetStoryPasswordLogStatus;
const loginStoryLog = state => state.storiesUi.loginStoryLog;
const loginStoryLogStatus = state => state.storiesUi.loginStoryLogStatus;
const createStoryLog = state => state.storiesUi.createStoryLog;
const createStoryLogStatus = state => state.storiesUi.createStoryLogStatus;


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
  isLoginModalOpen,
  isResetPasswordModalOpen,
  resetPasswordStoryId,
  notAuthStoryId,
  storyToasterLog,
  storyToasterLogStatus,
  resetStoryPasswordLog,
  resetStoryPasswordLogStatus,
  loginStoryLog,
  loginStoryLogStatus,
  createStoryLog,
  createStoryLogStatus,
});

