/**
 * This module provides unit tests for the story manager duck
 * @module fonio/feature/StoryManager
 */
import expect from 'expect';

import reducer, {
  UPDATE_SECTIONS_ORDER,
  CREATE_SECTION,
  DELETE_SECTION,
  DELETE_RESOURCE,
} from './duck';

/**
 * * TESTING - Async Actions
 * ACTIVATE_STORY
 * UPLOAD_RESOURCE
 * DELETE_UPLOADED_RESOURCE
 */

/**
 * * TESTING - Reducers
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

    it( 'a section was added in summary view, section should be appended in section orders', () => {
      const expectedSectionsOrder = [ 'a', 'b', 'c', 'd', 'e' ];
      const action = {
        ...baseAction,
        payload: {
          storyId: 'storyOne',
          sectionId: 'e',
          section: {},
          sectionIndex: 4
        }
      }
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.sectionsOrder ).toEqual( expectedSectionsOrder );
    } );

    it( 'a section was added in summary view, section should be appended in sections', () => {
      const action = {
        ...baseAction,
        payload: {
          storyId: 'storyOne',
          sectionId: 'e',
          section: {},
          sectionIndex: 4
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

    it( 'a section was insert in section view, section should be inserted in section orders', () => {
      const action = {
        ...baseAction,
        payload: {
          storyId: 'storyOne',
          sectionId: 'e',
          section: {},
          sectionIndex: 2
        }
      };
      const expectedSectionsOrder = [ 'a', 'b', 'e', 'c', 'd' ];
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.sectionsOrder ).toEqual( expectedSectionsOrder );
    } );

    it( 'a section was added in section view, section should be inserted in section orders', () => {
      const action = {
        ...baseAction,
        payload: {
          storyId: 'storyOne',
          sectionId: 'e',
          section: {},
          sectionIndex: 2
        }
      };
      const expectedSections = {
        a: {},
        b: {},
        e: {},
        c: {},
        d: {},
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
            ctxtionOne: {
              id: 'ctxtionOne',
              resourceId: 'resourceOne',
              contextualizerId: 'ctxlizerOne',
              sectionId: 'b'
            },
          },
          contextualizers: {
            ctxlizerOne: {
              id: 'ctxlizerOne',
              type: 'image'
            }
          }
        }
      }
    };
    const action = {
      type: `${DELETE_SECTION}_SUCCESS`,
      payload: {
        sectionId: 'b'
      },
    };

    it( 'a section was delete, section order should be updated', () => {
      const expectedSectionsOrder = [ 'a', 'c', 'd' ];
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.sectionsOrder ).toEqual( expectedSectionsOrder );
    } );

    it( 'a section was delete, sections should be updated', () => {
      const expectedSections = {
        a: {},
        c: {},
        d: {}
      };
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.sections ).toEqual( expectedSections );
    } );

    it( 'a section was delete, contextualizations should be updated', () => {
      const expectedContextualizations = {};
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.contextualizations ).toEqual( expectedContextualizations );
    } );

    it( 'a section was delete, contextualizers should be deleted', () => {
      const expectedContextualizers = {};
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.contextualizers ).toEqual( expectedContextualizers );
    } );
  } );

  describe( 'DELETE_RESOURCE action', () => {
    const mockState = {
      story: {
        story: {
          resources: {
            resourceOne: {}
          },
          contextualizations: {
            ctxtionOne: {
              id: 'ctxtionOne',
              resourceId: 'resourceOne',
              contextualizerId: 'ctxlizerOne',
              sectionId: 'a'
            }
          },
          contextualizers: {
            ctxlizerOne: {
              id: 'ctxlizerOne',
              type: 'image'
            }
          }
        }
      }
    };

    const action = {
      type: `${DELETE_RESOURCE}_SUCCESS`,
      payload: {
        resourceId: 'resourceOne'
      }
    };

    it( 'a resource was delete, contextualizations should be updated', () => {
      const expectedContextualizations = {};
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.contextualizations ).toEqual( expectedContextualizations );
    } );

    it( 'a resource was delete, contextualizers should be updated', () => {
      const expectedContextualizers = {};
      const resultState = reducer( mockState, action );
      expect( resultState.story.story.contextualizers ).toEqual( expectedContextualizers );
    } );
  } );
} );

/**
 * * TESTING - selectors (no ui selectors, no test for now)
 */
