/**
 * This module exports logic-related elements for the fonio story settings manager feature
 * This module follows the ducks convention for putting in the same place actions, action types,
 * state selectors and reducers about a given feature (see https://github.com/erikras/ducks-modular-redux)
 * @module fonio/features/StorySettingsManager
 */

import {combineReducers} from 'redux';
import {createStructuredSelector} from 'reselect';
import {persistentReducer} from 'redux-pouchdb';

import {
  getCitationStylesListFromServer,
  getCitationStyleFromServer,
  getCitationLocalesListFromServer,
  getCitationLocaleFromServer,
} from '../../helpers/resourcesUtils';
import {
  processCustomCss
} from '../../helpers/postcss';


/**
 * ACTION NAMES
 */
const SET_SETTINGS_VISIBILITY = '§Fonio/StorySettingsManager/SET_SETTINGS_VISIBILITY';

export const SET_STORY_CSS = '§Fonio/StorySettingsManager/SET_STORY_CSS';
export const SET_STORY_CSS_FROM_USER = '§Fonio/StorySettingsManager/SET_STORY_CSS_FROM_USER';
export const SET_STORY_SETTING_OPTION = '§Fonio/StorySettingsManager/SET_STORY_SETTING_OPTION';
export const SET_STORY_TEMPLATE = '§Fonio/StorySettingsManager/SET_STORY_TEMPLATE';

const FETCH_CITATION_STYLES_LIST = '§Fonio/StorySettingsManager/FETCH_CITATION_STYLES_LIST';
export const FETCH_CITATION_STYLE = '§Fonio/StorySettingsManager/FETCH_CITATION_STYLE';
const FETCH_CITATION_LOCALES_LIST = '§Fonio/StorySettingsManager/FETCH_CITATION_LOCALES_LIST';
export const FETCH_CITATION_LOCALE = '§Fonio/StorySettingsManager/FETCH_CITATION_LOCALE';

/*
 * Action creators
 */

/**
 * Sets the visibility of the settings pannel
 * @param {boolean} visible - whether the pannel is visible
 * @return {object} action - the redux action to dispatch
 */
export const setSettingsVisibility = (visible) => ({
  type: SET_SETTINGS_VISIBILITY,
  visible
});

/**
 * Sets the settings' custom css of a story
 * @param {string} id - id of the story to update
 * @param {string} css - the new css to set
 * @return {object} action - the redux action to dispatch
 */
export const setStoryCss = (id, css) => ({
  type: SET_STORY_CSS,
  id,
  css: processCustomCss(css),
});

/**
 * Sets the settings' custom css of a story as seen by the user
 * @param {string} id - id of the story to update
 * @param {string} css - the new css to set
 * @return {object} action - the redux action to dispatch
 */
export const setStoryCssFromUser = (id, css) => ({
  type: SET_STORY_CSS_FROM_USER,
  id,
  css,
});

/**
 * Sets an option in the settings (options are template-dependent)
 * @param {string} id - id of the story to update
 * @param {string} field - field key to update
 * @param {string|number|boolean} value - value to set
 * @return {object} action - the redux action to dispatch
 */
export const setStorySettingOption = (id, field, value) => ({
  type: SET_STORY_SETTING_OPTION,
  id,
  field,
  value,
});

/**
 * Sets the settings's template of a story
 * @param {string} id - id of the story to template
 * @param {string} template - id of the template to set
 * @return {object} action - the redux action to dispatch
 */
export const setStoryTemplate = (id, template) => ({
  type: SET_STORY_TEMPLATE,
  id,
  template,
});

/**
 * Fetches the list of available citation styles from server
 * @return {object} action - the redux action to dispatch
 */
export const getCitationStylesList = () => ({
  type: FETCH_CITATION_STYLES_LIST,
  promise: () => {
    return new Promise((resolve, reject) => {
      return getCitationStylesListFromServer()
      .then(citationStylesList => {
        resolve(citationStylesList);
      })
      .catch(e => {
        reject(e);
      });
    });
  }
});

/**
 * Fetches a citation style data to store in a story's settings
 * @param {string} storyId - the id of the story to update
 * @param {string} styleId - the id of the style to fetch from server
 * @return {object} action - the redux action to dispatch
 */
export const setCitationStyle = (storyId, styleId) => ({
  type: FETCH_CITATION_STYLE,
  promise: () => {
    return new Promise((resolve, reject) => {
      return getCitationStyleFromServer(styleId)
      .then(citationStyle => {
        resolve({storyId, citationStyle});
      })
      .catch(e => {
        reject(e);
      });
    });
  }
});

/**
 * Fetches the list of available citation locales
 * @return {object} action - the redux action to dispatch
 */
export const getCitationLocalesList = () => ({
  type: FETCH_CITATION_LOCALES_LIST,
  promise: () => {
    return new Promise((resolve, reject) => {
      return getCitationLocalesListFromServer()
      .then(citationLocalesList => {
        resolve(citationLocalesList);
      })
      .catch(e => {
        reject(e);
      });
    });
  }
});

/**
 * Fetches a citation locale to store in a story's settings
 * @param {string} storyId  - the story to update
 * @param {string} localeId - the id of the locale to fetch
 * @return {object} action - the redux action to dispatch
 */
export const setCitationLocale = (storyId, localeId) => ({
  type: FETCH_CITATION_LOCALE,
  promise: () => {
    return new Promise((resolve, reject) => {
      return getCitationLocaleFromServer(localeId)
      .then(citationLocale => {
        resolve({storyId, citationLocale});
      })
      .catch(e => {
        reject(e);
      });
    });
  }
});

/*
 * Reducers
 */


/**
 * Default state of the settings manager ui
 */
const SETTINGS_MANAGER_UI_DEFAULT_STATE = {

  /**
   * Whether to display settings pannel
   */
  settingsVisible: false,

  /**
   * Available citation styles
   * @type {array<object>}
   */
  citationStylesList: [],

  /**
   * Available citation languages
   * @type {array<object>}
   */
  citationLocalesList: [],

  /**
   * Status of current xhr request
   */
  xhrStatus: undefined
};

/**
 * Handles the state change of manager ui
 * @param {object} state - the previous state
 * @param {object} action - the dispatched action
 * @return {object} state - the new state
 */
function settingsManagerUi (state = SETTINGS_MANAGER_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    // settings are shown or hidden
    case SET_SETTINGS_VISIBILITY:
      return {
        ...state,
        settingsVisible: action.visible,
      };
    // handling xhr requests ui representation
    case FETCH_CITATION_STYLES_LIST + '_PENDING':
    case FETCH_CITATION_LOCALES_LIST + '_PENDING':
    case FETCH_CITATION_LOCALE + '_PENDING':
    case FETCH_CITATION_STYLE + '_PENDING':
      return {
        ...state,
        xhrStatus: 'processing'
      };
    case FETCH_CITATION_STYLES_LIST + '_SUCCESS':
      return {
        ...state,
        citationStylesList: action.result,
        xhrStatus: undefined
      };
    case FETCH_CITATION_LOCALES_LIST + '_SUCCESS':
      return {
        ...state,
        citationLocalesList: action.result,
        xhrStatus: undefined
      };
    case FETCH_CITATION_LOCALES_LIST + '_FAIL':
    case FETCH_CITATION_STYLES_LIST + '_FAIL':
    case FETCH_CITATION_LOCALE + '_FAIL':
    case FETCH_CITATION_STYLE + '_FAIL':
    case FETCH_CITATION_LOCALE + '_SUCCESS':
    case FETCH_CITATION_STYLE + '_SUCCESS':
      return {
        ...state,
        xhrStatus: undefined
      };
    default:
      return state;
  }
}


/**
 * The module exports a reducer connected to pouchdb thanks to redux-pouchdb
 */
export default combineReducers({
  settingsManagerUi: persistentReducer(settingsManagerUi, 'fonio-settings-manager-ui')
});

/*
 * Selectors
 */
const citationStylesList = state => state.settingsManagerUi.citationStylesList;
const citationLocalesList = state => state.settingsManagerUi.citationLocalesList;
const settingsVisible = state => state.settingsManagerUi.settingsVisible;
const xhrStatus = state => state.settingsManagerUi.xhrStatus;

/**
 * The selector is a set of functions for accessing this feature's state
 * @type {object}
 */
export const selector = createStructuredSelector({
  citationStylesList,
  citationLocalesList,
  settingsVisible,
  xhrStatus,
});
