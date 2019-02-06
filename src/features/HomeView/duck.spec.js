import expect from 'expect';

import {
  ui as uiReducer,
  SET_TAB_MODE,
  SET_SEARCH_STRING,
  SET_SORTING_MODE,
  SET_IDENTIFICATION_MODAL_SWITCH,
  SET_PREVIEWED_STORY_ID,
  SET_STORY_DELETE_ID,
  SET_CHANGE_PASSWORD_ID,
  SET_OVERRIDE_IMPORT,
  SET_OVERRIDE_STORY_MODE,
  SET_NEW_STORY_OPEN,
  SET_NEW_STORY_TAB_MODE,
  SET_PASSWORD_MODAL_OPEN
} from './duck';

describe( 'HomeView ui reducer test', () => {
  let mockState;
  let action;

  beforeEach( () => {
    mockState = {};
  } );

  test.each( [
    [ 'stories', SET_TAB_MODE, 'stories', 'tabMode' ],
    [ 'searchinput', SET_SEARCH_STRING, 'searchinput', 'searchString' ],
    [ 'title', SET_SORTING_MODE, 'title', 'sortingMode' ],
    [ false, SET_IDENTIFICATION_MODAL_SWITCH, false, 'identificationModalSwitch' ],
    [ 'testStoryId', SET_PREVIEWED_STORY_ID, 'testStoryId', 'previewedStoryId' ],
    [ 'testStoryId', SET_STORY_DELETE_ID, 'testStoryId', 'storyDeleteId' ],
    [ 'testStoryId', SET_CHANGE_PASSWORD_ID,'testStoryId', 'changePasswordId' ],
    [ false, SET_OVERRIDE_IMPORT, false, 'overrideImport' ],
    [ 'create', SET_OVERRIDE_STORY_MODE, 'create', 'overrideStoryMode' ],
    [ false, SET_NEW_STORY_OPEN, false, 'newStoryOpen' ],
    [ 'form', SET_NEW_STORY_TAB_MODE, 'form', 'newStoryTabMode' ],
    [ false, SET_PASSWORD_MODAL_OPEN, false, 'passwordModalOpen' ],
  ] )(
    'should return %p when %s with %p',
    ( expected, actionName, input, reducerName ) => {
      action = {
        type: actionName,
        payload: input
      };
      const resultState = uiReducer( mockState, action );
      expect( resultState[reducerName] ).toEqual( expected );
    },
  );
} );
