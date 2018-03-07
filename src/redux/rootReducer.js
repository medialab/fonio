/**
 * Fonio Reducers Endpoint
 * ===================================
 *
 * Combining the app's reducers.
 */
import {combineReducers} from 'redux';

import {i18nState} from 'redux-i18n';

import {loadingBarReducer} from 'react-redux-loading-bar';

import storyEditor from './../features/StoryEditor/duck';
import storySettingsManager from './../features/StorySettingsManager/duck';
import storyCandidate from './../features/ConfigurationDialog/duck';
import stories from './../features/StoriesManager/duck';
import takeAway from './../features/TakeAwayDialog/duck';
import resourcesManager from './../features/ResourcesManager/duck';
import sectionsManager from './../features/SectionsManager/duck';
import globalUi from './../features/GlobalUi/duck';

const saveLang = (state = {}, action) => {
  if (action.type === 'REDUX_I18N_SET_LANGUAGE') {
    localStorage.setItem('fonio-lang', action.lang);
    return state;
  } else return state;
}

export default combineReducers({
  i18nState,
  saveLang,
  loadingBar: loadingBarReducer,
  storySettingsManager,
  resourcesManager,
  sectionsManager,
  storyCandidate,
  storyEditor,
  takeAway,
  globalUi,
  stories,
});
