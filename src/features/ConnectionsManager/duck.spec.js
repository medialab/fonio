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
  INACTIVATE_STORY,
  SET_USER_AS_ACTIVE_BROADCAST,
  SET_USER_AS_IDLE_BROADCAST,
  USER_DISCONNECTING
} from './duck';

import { DELETE_STORY } from '../HomeView/duck';
import { ACTIVATE_STORY } from '../StoryManager/duck';

/**
 * * TESTING - Reducers
 */

describe( 'locking reducer test', () => {
  let mockState;
  let action;
  describe( 'ACTIVATE_STORY/ENTER_STORY action', () => {
    beforeEach( () => {
      mockState = {
        locking: {}
      };
    } );
    it( 'an user activate(enter) a story success', () => {
      action = {
        type: `${ACTIVATE_STORY}_SUCCESS`,
        payload: {
          storyId: 'storyOne',
          userId: 'userOne'
        }
      };
      const resultState = reducer( mockState, action );
      expect( resultState.locking.storyOne.locks.userOne ).toBeDefined();
    } );

    it( 'an user enter a story broadcast', () => {
      action = {
        type: `${ENTER_STORY}_BROADCAST`,
        payload: {
          storyId: 'storyOne',
          userId: 'userOne'
        }
      };
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

  describe( 'DELETE_STORY and INACTIVATE_STORY action', () => {
    beforeEach( () => {
      mockState = {
        locking: {
          storyOne: {
            locks: {}
          }
        }
      };
    } );
    it( 'user delete a story', () => {
      action = {
        type: `${DELETE_STORY}_BROADCAST`,
        payload: {
          id: 'storyOne',
        }
      };
      const resultState = reducer( mockState, action );
      expect( resultState.locking.storyOne ).toBeUndefined();
    } );

    it( 'user inactivate a story', () => {
      action = {
        type: INACTIVATE_STORY,
        payload: {
          id: 'storyOne',
        }
      };
      const resultState = reducer( mockState, action );
      expect( resultState.locking.storyOne ).toBeUndefined();
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

  describe( 'USER_DISCONNECTING action', () => {
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
        type: USER_DISCONNECTING,
        payload: {
          userId: 'userOne',
          rooms: [ 'storyOne' ]
        }
      };
    } );
    it( 'user disconnecting, should remove user lock from the story he in', () => {
      const resultState = reducer( mockState, action );
      expect( resultState.locking.storyOne.locks.userOne ).toBeUndefined();
    } );
  } );
} );
