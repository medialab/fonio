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
  describe( 'unit test for computeCopiedData', () => {
    it( 'editor states creation', () => {
      const editorStates = services.getEditorStates( story );
      const copiedEditor = {
        editorFocus: 'main',
        editorStates,
        activeSection: {
          id: story.sectionsOrder[0]
        },
        story,
      };
      expect( computeCopiedData( copiedEditor ) ).toBeDefined();
    } );
  } );
} );
