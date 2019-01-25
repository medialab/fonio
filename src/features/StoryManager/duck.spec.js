/**
 * This module provides unit tests for the story manager duck
 * @module fonio/feature/StoryManager
 */
import expect from 'expect';

import reducer, {
  UPDATE_SECTIONS_ORDER,
  CREATE_SECTION,
  DELETE_SECTION,
} from './duck';

/**
 * * REDUCERS TESTING
 * TODO: better mockState -  initalization
 */

describe( 'story reducer test', () => {
  describe( 'UPDATE_SECTIONS_ORDER action', () => {
    const mockState = {
      story: {
        story: {
          sectionsOrder: [ 'a', 'b', 'c', 'd' ]
        }
      }
    };
    const baseAction = {
      type: UPDATE_SECTIONS_ORDER,
      payload: {},
    };

    it( 'should successfully update sections order in normal cases', () => {
      const providedSectionsOrder = [ 'b', 'a', 'c', 'd' ];
      const action = {
        ...baseAction,
        payload: {
          sectionsOrder: providedSectionsOrder
        }
      };
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.sectionsOrder ).toEqual( providedSectionsOrder );
    } );
    it( 'should successfully update sections order after a section was deleted', () => {
      const providedSectionsOrder = [ 'b', 'a', 'c', 'e', 'd' ];
      const expectedSectionsOrder = [ 'b', 'a', 'c', 'd' ];
      const action = {
        ...baseAction,
        payload: {
          sectionsOrder: providedSectionsOrder
        }
      };

      const resultState = reducer( mockState, action );
      expect( resultState.story.story.sectionsOrder ).toEqual( expectedSectionsOrder );
    } );
    it( 'should successfully update sections order after a section was added', () => {
      const providedSectionsOrder = [ 'b', 'a', 'c' ];
      const expectedSectionsOrder = [ 'b', 'a', 'c', 'd' ];
      const action = {
        ...baseAction,
        payload: {
          sectionsOrder: providedSectionsOrder
        }
      };
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.sectionsOrder ).toEqual( expectedSectionsOrder );
    } );

  } );

  describe( 'CREATE_SECTION action', () => {
    const mockState = {
      story: {
        story: {
          sections: {
            a: {},
            b: {},
            c: {},
            d: {},
          },
          sectionsOrder: [ 'a', 'b', 'c', 'd' ]
        }
      }
    };
    const baseAction = {
      type: CREATE_SECTION,
      payload: {},
    };

    it( 'a section was added, section order changed', () => {
      const action = {
        ...baseAction,
        payload: {
          sectionId: 'e',
          section: {},
        }
      };
      const expectedSectionsOrder = [ 'a', 'b', 'c', 'd', 'e' ];
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.sectionsOrder ).toEqual( expectedSectionsOrder );
    } );

    it( 'a section was added, sections append', () => {
      const action = {
        ...baseAction,
        payload: {
          sectionId: 'e',
          section: {},
        }
      };
      const expectedSections = {
        a: {},
        b: {},
        c: {},
        d: {},
        e: {}
      };
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.sections ).toEqual( expectedSections );
    } );
  } );

  describe( 'DELETE_SECTION action', () => {
    const mockState = {
      story: {
        story: {
          sections: {
            a: {},
            b: {},
            c: {},
            d: {},
          },
          sectionsOrder: [ 'a', 'b', 'c', 'd' ],
          contextualizations: {
            ctxtion1: {
              id: 'ctxtion1',
              resourceId: 'resource1',
              contextualizerId: 'ctxlizer1',
              sectionId: 'b'
            },
          },
          contextualizers: {
            ctxlizer1: {
              id: 'ctxlizer1',
              type: 'image'
            }
          }
        }
      }
    };
    const baseAction = {
      type: `${DELETE_SECTION}_SUCCESS`,
      payload: {},
    };

    it( 'a section was delete, section order should be updated', () => {
      const action = {
        ...baseAction,
        payload: {
          sectionId: 'b'
        }
      };
      const expectedSectionsOrder = [ 'a', 'c', 'd' ];
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.sectionsOrder ).toEqual( expectedSectionsOrder );
    } );

    it( 'a section was delete, sections should be updated', () => {
      const action = {
        ...baseAction,
        payload: {
          sectionId: 'b'
        }
      };
      const expectedSections = {
        a: {},
        c: {},
        d: {}
      };
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.sections ).toEqual( expectedSections );
    } );

    it( 'a section was delete, contextualizations should be updated', () => {
      const action = {
        ...baseAction,
        payload: {
          sectionId: 'b'
        }
      };
      const expectedContextualizations = {};
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.contextualizations ).toEqual( expectedContextualizations );
    } );

    it( 'a section was delete, contextualizers should be deleted', () => {
      const action = {
        ...baseAction,
        payload: {
          sectionId: 'b'
        }
      };
      const expectedContextualizers = {};
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.contextualizers ).toEqual( expectedContextualizers );
    } );
  } );
} );

/**
 * * Selectors TESTING
 */
