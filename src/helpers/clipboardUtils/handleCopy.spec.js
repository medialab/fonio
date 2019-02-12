/**
 * This module provides unit tests for the assetsUtils module
 * @module fonio/helpers/clipboardUtils/handleCopy
 * @funciton computeCopiedData()
 * @param {string} editorFocus
 * @param {object} editorStates with {immutable} editorState
 * @param {object} story
 */

import expect from 'expect';
import services from './__mocks__/services.js';
import story from './__mocks__/story';
import {
  computeCopiedData
} from './handleCopy';

describe( 'unit test for handleCopy', () => {
  describe( 'unit test for computeCopiedData()', () => {
    it( 'forward selection copy', () => {
      const editorStates = services.getEditorStates( {
        story,
        isBackward: false
      } );
      const copiedEditor = {
        editorFocus: 'main',
        editorStates,
        activeSection: {
          id: story.sectionsOrder[0]
        },
        story,
      };

      const {
        copiedContextualizations,
        copiedContextualizers,
        copiedResources,
      } = computeCopiedData( copiedEditor );
      const expectedContextualizations = Object.keys( story.contextualizations ).map( ( id ) => story.contextualizations[id] );
      const expectedContextualizers = Object.keys( story.contextualizers ).map( ( id ) => story.contextualizers[id] );
      const expectedResources = Object.keys( story.resources ).map( ( id ) => story.resources[id] );

      expect( copiedContextualizations ).toEqual( expectedContextualizations );
      expect( copiedContextualizers ).toEqual( expectedContextualizers );
      expect( copiedResources ).toEqual( expectedResources );
    } );

    it( 'backward selection copy', () => {
      const editorStates = services.getEditorStates( {
        story,
        isBackward: true
      } );
      const copiedEditor = {
        editorFocus: 'main',
        editorStates,
        activeSection: {
          id: story.sectionsOrder[0]
        },
        story,
      };

      const {
        copiedContextualizations,
        copiedContextualizers,
        copiedResources,
      } = computeCopiedData( copiedEditor );
      const expectedContextualizations = Object.keys( story.contextualizations ).map( ( id ) => story.contextualizations[id] );
      const expectedContextualizers = Object.keys( story.contextualizers ).map( ( id ) => story.contextualizers[id] );
      const expectedResources = Object.keys( story.resources ).map( ( id ) => story.resources[id] );

      expect( copiedContextualizations ).toEqual( expectedContextualizations );
      expect( copiedContextualizers ).toEqual( expectedContextualizers );
      expect( copiedResources ).toEqual( expectedResources );
    } );
  } );
} );
