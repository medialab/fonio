/**
 * Fonio Reducers Endpoint
 * ===================================
 *
 * Combining the app's reducers.
 */
import {combineReducers} from 'redux';

import {i18nState} from 'redux-i18n';

import {persistentReducer} from 'redux-pouchdb';


import fonioEditor from './../features/Editor/duck';
import storyCandidate from './../features/ConfigurationDialog/duck';
import stories from './../features/StoriesManager/duck';
import takeAway from './../features/TakeAwayDialog/duck';
import resourcesManager from './../features/ResourcesManager/duck';

import * as modelsModels from './../models';

const models = (state = modelsModels) => state;

export default combineReducers({
  fonioEditor,
  storyCandidate,
  stories,
  models,
  takeAway,
  resourcesManager,
  i18nState: persistentReducer(i18nState, 'i18n')
});
