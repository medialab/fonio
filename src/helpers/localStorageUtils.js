/**
 * This module helps to manage local storage data
 * @module fonio/utils/localStorageUtils
 */
export const loadStoryToken = ( storyId ) => {
  return localStorage.getItem( `fonio/storyToken/${storyId}` );
};
export const saveStoryToken = ( storyId, token ) => {
  localStorage.setItem( `fonio/storyToken/${storyId}`, token );
};
export const deleteStoryToken = ( storyId ) => {
  localStorage.removeItem( `fonio/storyToken/${storyId}` );
};

export const updateEditionHistoryMap = ( storyId ) => {
  const existing = localStorage.getItem( 'fonio/editionStoryMap' );
  let previousMap;
  try {
    if ( existing ) {
      previousMap = JSON.parse( existing );
    }
 else previousMap = {};
  }
 catch ( e ) {
    previousMap = {};
  }
  const newMap = {
    ...previousMap,
    [storyId]: new Date().getTime()
  };
  localStorage.setItem( 'fonio/editionStoryMap', JSON.stringify( newMap ) );
};

const getJSONFromStorage = ( key ) => {
  const existing = localStorage.getItem( key );
  let result;
  try {
    if ( existing ) {
      result = JSON.parse( existing );
    }
  }
  catch ( e ) {
    result = undefined;
  }
  return result;
};

export const getEditionHistoryMap = () => {
  return getJSONFromStorage( 'fonio/editionStoryMap' ) || {};
};

export const saveUserInfo = ( userInfo ) => {
  localStorage.setItem( 'fonio/user_info', JSON.stringify( userInfo ) );
};

export const loadUserInfo = () => {
  return getJSONFromStorage( 'fonio/user_info' );
};
