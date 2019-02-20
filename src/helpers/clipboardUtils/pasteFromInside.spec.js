/**
 * This module provides unit tests for the assetsUtils module
 * @module fonio/helpers/clipboardUtils/handleCopy
 * @funciton computePastedData()
 * @param {object } copiedData - mock from computeCopiedData from handleCopy.js
 * @param {object} copiedResources - suppose to retrieve from localStorage, get from computeCopiedData when test
 * @param {string} editorFocus - 'main' or noteId,
 * @param {immutable} editorStates - with {immutable} editorState mock from insidePaste.json,
 * @param {object} activeSection - {id},
 * @param {object} editor - call only when note copied (not test copy cases for now),
 * @param {object} notes - empty object when no note copied (not test copy cases for now),
 * @param {object} story - {resources} same mock data as computeCopiedData
 */

import expect from 'expect';
import {
  getEditorStates,
  getClipboardContentState
} from './__mocks__/services.js';

import pasteInsideTests from './__mocks__/pasteInsideTests';
import copyTests from './__mocks__/copyTests';

import {
  processCopy
} from './handleCopy';

import {
  computePastedData,
} from './pasteFromInside';

describe( 'test computePastedData()', () => {
  const citations = {
    citationItems: {},
    citationData: []
  };
  describe.each( [
    [ 'inline-bib-in-main', 'main' ],
  ] )( 'copy %s from %s', ( testName, editorFocus ) => {
    const story = copyTests.find( ( item ) => item.name === testName ).data;
    const { sectionsOrder } = story;
    const activeSectionId = sectionsOrder[0];
    const editorStates = getEditorStates( {
      story,
      editorFocus
    } );
    const clipboardContentState = getClipboardContentState( { story, editorFocus } );
    const clipboard = clipboardContentState.getBlockMap();

    const {
      copiedData,
    } = processCopy( {
      editorFocus,
      editorStates,
      activeSection: {
        id: activeSectionId
      },
      story,
      citations,
      clipboard
    } );

    test.each( [
      [ 'empty-main-editor', 'main' ]
    ] )( 'test paste to %s', ( name, pasteEditorFocus ) => {
      const pasteInsideTest = pasteInsideTests.find( ( item ) => item.name === name ).data;  
      const pasteEditorStates = getEditorStates( {
        story: pasteInsideTest,
        isBackward: false,
        editorFocus: pasteEditorFocus
      } );
      const data = computePastedData( {
        copiedData,
        copiedResources: copiedData.copiedResources,
        editorFocus: pasteEditorFocus,
        editorStates: pasteEditorStates,
        activeSection: {
          id: pasteInsideTest.sectionsOrder[0]
        },
        editor: null,
        notes: {},
        story
      } );
      expect( data ).toBeDefined();
    } );
  } );
} );

