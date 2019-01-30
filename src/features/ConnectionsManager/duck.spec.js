/**
 * This module provides unit tests for the connections manager duck
 * @module fonio/feature/ConnectionsManager
 */
import expect from 'expect';

import reducer, {
  ENTER_STORY,
  LEAVE_STORY,
  ENTER_BLOCK,
  LEAVE_BLOCK,
  SET_USER_AS_ACTIVE_BROADCAST,
  SET_USER_AS_IDLE_BROADCAST,
} from './duck';

/**
 * * TESTING - Reducers
 */

describe( 'locking reducer test', () => {
  let mockState;
  let action;
  describe( 'ENTER_STORY action', () => {
    beforeEach( () => {
      mockState = {
        locking: {}
      };
      action = {
        type: ENTER_STORY,
        payload: {
          storyId: 'storyOne',
          userId: 'userOne'
        }
      };
    } );
    it( 'an user enter a story', () => {
      const resultState = reducer( mockState, action );
      expect( resultState.locking.storyOne.locks.userOne ).toBeDefined();
    } );
  } );

  describe( 'LEAVE_STORY action', () => {
    beforeEach( () => {
      mockState = {
        locking: {
          storyOne: {
            locks: {
              userOne: {}
            }
          }
        }
      };
      action = {
        type: LEAVE_STORY,
        payload: {
          storyId: 'storyOne',
          userId: 'userOne'
        }
      };
    } );
    it( 'user leave a story', () => {
      const resultState = reducer( mockState, action );
      expect( resultState.locking.storyOne.locks.userOne ).toBeUndefined();
    } );
  } );

  describe( 'ENTER_BLOCK action', () => {
    beforeEach( () => {
      mockState = {
        locking: {
          storyOne: {
            locks: {}
          }
        }
      };
      action = {
        type: `${ENTER_BLOCK}_SUCCESS`,
        payload: {
          storyId: 'storyOne',
          userId: 'userOne',
          blockId: 'sectionOne',
          blockType: 'sections',
        }
      };
    } );
    it( 'user enter a section', () => {
      const resultState = reducer( mockState, action );
      expect( resultState.locking.storyOne.locks.userOne.sections ).toBeDefined();
    } );
  } );

  describe( 'LEAVE_BLOCK action', () => {
    beforeEach( () => {
      mockState = {
        locking: {
          storyOne: {
            locks: {
              userOne: {
                sections: {}
              }
            }
          }
        }
      };
      action = {
        type: LEAVE_BLOCK,
        payload: {
          storyId: 'storyOne',
          userId: 'userOne',
          blockId: 'sectionOne',
          blockType: 'sections',
        }
      };
    } );
    it( 'user leave a section', () => {
      const resultState = reducer( mockState, action );
      expect( resultState.locking.storyOne.locks.userOne.sections ).toBeUndefined();
    } );
  } );

  describe( 'SET_USER_AS_IDLE action', () => {
    beforeEach( () => {
      mockState = {
        locking: {
          storyOne: {
            locks: {
              userOne: {
                status: 'active'
              }
            }
          }
        }
      };
      action = {
        type: SET_USER_AS_IDLE_BROADCAST,
        payload: {
          storyId: 'storyOne',
          userId: 'userOne',
        }
      };
    } );
    it( 'set a user as idle', () => {
      const resultState = reducer( mockState, action );
      expect( resultState.locking.storyOne.locks.userOne.status ).toEqual( 'idle' );
    } );
  } );

  describe( 'SET_USER_AS_ACTIVE action', () => {
    beforeEach( () => {
      mockState = {
        locking: {
          storyOne: {
            locks: {
              userOne: {
                status: 'idle'
              }
            }
          }
        }
      };
      action = {
        type: SET_USER_AS_ACTIVE_BROADCAST,
        payload: {
          storyId: 'storyOne',
          userId: 'userOne',
        }
      };
    } );
    it( 'set a user as idle', () => {
      const resultState = reducer( mockState, action );
      expect( resultState.locking.storyOne.locks.userOne.status ).toEqual( 'active' );
    } );
  } );
} );
