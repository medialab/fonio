/**
 * This module provides unit tests for the assetsUtils module
 * @module fonio/helpers/clipboardUtils/handleCopy
 * @funciton computePastedData()
 * @param {string} html - mock from handleCopy
 * @param {object} activeSection - mock from state
 * @param {object} resources - mock from story json
 */

import expect from 'expect';
import {
} from './__mocks__/services.js';
import tests from './__mocks__/pasteOutsideTests';
import {
  computePastedData,
} from './pasteFromOutside';

const testCases = tests.map( ( item ) => {
  return [ item.name ];
} );
describe( 'test computePastedData()', () => {
  test.each( testCases )( 'test', ( testName ) => {
    const {
      html,
      resources,
      expectedResourcesToAdd,
      expectedContextualizationsToAdd,
      expectedContextualizersToAdd,
      expectedImagesToAdd
    } = tests.find( ( item ) => item.name === testName );
    const computedData = computePastedData( {
      html,
      resources,
      activeSection: {
        id: 'testSectionId'
      }
    } );
    const {
      copiedContentState,
      resourcesToAdd,
      contextualizationsToAdd,
      contextualizersToAdd,
      imagesToAdd
    } = computedData;
    expect( copiedContentState ).toBeDefined();
    expect( resourcesToAdd.length ).toEqual( expectedResourcesToAdd );
    expect( contextualizationsToAdd.length ).toEqual( expectedContextualizationsToAdd );
    expect( contextualizersToAdd.length ).toEqual( expectedContextualizersToAdd );
    expect( imagesToAdd.length ).toEqual( expectedImagesToAdd );
  } );
} );

