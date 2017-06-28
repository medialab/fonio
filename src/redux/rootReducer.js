/**
 * Fonio Reducers Endpoint
 * ===================================
 *
 * Combining the app's reducers.
 */
import {combineReducers} from 'redux';

import {i18nState} from 'redux-i18n';

import {persistentReducer} from 'redux-pouchdb';


import storyEditor from './../features/StoryEditor/duck';
import storyCandidate from './../features/ConfigurationDialog/duck';
import stories from './../features/StoriesManager/duck';
import takeAway from './../features/TakeAwayDialog/duck';
import resourcesManager from './../features/ResourcesManager/duck';
import sectionsManager from './../features/SectionsManager/duck';
import globalUi from './../features/GlobalUi/duck';

import * as modelsModels from './../models';

const models = (state = modelsModels) => state;

export default combineReducers({
  i18nState: persistentReducer(i18nState, 'i18n'),
  resourcesManager,
  sectionsManager,
  storyCandidate,
  storyEditor,
  takeAway,
  globalUi,
  stories,
  models,
});
