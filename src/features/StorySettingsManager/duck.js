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

/**
 * ACTION NAMES
 */
const SET_SETTINGS_VISIBILITY = '§Fonio/StorySettingsManager/SET_SETTINGS_VISIBILITY';

export const SET_STORY_CSS = '§Fonio/StorySettingsManager/SET_STORY_CSS';
export const SET_STORY_SETTING_OPTION = '§Fonio/StorySettingsManager/SET_STORY_SETTING_OPTION';
export const SET_STORY_TEMPLATE = '§Fonio/StorySettingsManager/SET_STORY_TEMPLATE';

const FETCH_CITATION_STYLES_LIST = '§Fonio/StorySettingsManager/FETCH_CITATION_STYLES_LIST';
export const FETCH_CITATION_STYLE = '§Fonio/StorySettingsManager/FETCH_CITATION_STYLE';
const FETCH_CITATION_LOCALES_LIST = '§Fonio/StorySettingsManager/FETCH_CITATION_LOCALES_LIST';
export const FETCH_CITATION_LOCALE = '§Fonio/StorySettingsManager/FETCH_CITATION_LOCALE';

/*
 * Action creators
 */
export const setSettingsVisibility = (visible) => ({
  type: SET_SETTINGS_VISIBILITY,
  visible
});
export const setStoryCss = (id, css) => ({
  type: SET_STORY_CSS,
  id,
  css,
});
export const setStorySettingOption = (id, field, value) => ({
  type: SET_STORY_SETTING_OPTION,
  id,
  field,
  value,
});
export const setStoryTemplate = (id, template) => ({
  type: SET_STORY_TEMPLATE,
  id,
  template,
});
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
const SETTINGS_MANAGER_UI_DEFAULT_STATE = {
  settingsVisible: false,
  citationStylesList: [],
  citationLocalesList: [],
  xhrStatus: undefined
};
function settingsManagerUi (state = SETTINGS_MANAGER_UI_DEFAULT_STATE, action) {
  switch (action.type) {
    case SET_SETTINGS_VISIBILITY:
      return {
        ...state,
        settingsVisible: action.visible,
      };
    case FETCH_CITATION_STYLES_LIST:
    case FETCH_CITATION_LOCALES_LIST:
    case FETCH_CITATION_LOCALE:
    case FETCH_CITATION_STYLE:
      return {
        ...state,
        xhrStatus: 'loading'
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
