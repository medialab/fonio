/**
 * This module provides unit tests for the story manager duck
 * @module fonio/utils/fileLoader
 */
import { expect } from 'chai';

import reducer, { UPDATE_SECTIONS_ORDER } from './duck';

const mockState = {
  story: {
    story: {
      sectionsOrder: [ 'a', 'b', 'c', 'd' ]
    }
  }
};

describe( 'StoryManager duck', () => {
  describe( 'UPDATE_SECTIONS_ORDER action', () => {
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
      const result = reducer( mockState, action );
      expect( result.story.story.sectionsOrder ).eql( providedSectionsOrder );
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
      const result = reducer( mockState, action );
      expect( result.story.story.sectionsOrder ).eql( expectedSectionsOrder );
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
      const result = reducer( mockState, action );
      expect( result.story.story.sectionsOrder ).eql( expectedSectionsOrder );
    } );

  } );
} );
