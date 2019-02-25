/**
 * This module provides unit tests for the assetsUtils module
 * @module fonio/helpers/clipboardUtils/handleCopy
 * @funciton computePastedData()
 * @param {object } copiedData - mock from computeCopiedData from handleCopy.js
 * @param {object} copiedResources - suppose to retrieve from localStorage, get from computeCopiedData when test
 * @param {string} editorFocus - 'main' or noteId,
 * @param {immutable} editorStates - with {immutable} editorState mock from insidePaste.json,
 * @param {object} activeSection - {id},
 * @param {object} editor - need to provide only when note copied or paste into note editor(not test copy cases for now),
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

const testCases = pasteInsideTests.map( ( item ) => {
  return [ item.name, item.editorFocus ];
} );

describe( 'test computePastedData()', () => {
  const citations = {
    citationItems: {},
    citationData: []
  };
  describe.each( [
    [ 'inline-bib-in-main', 'main', 'inline' ],
    [ 'inline-glossary-in-main', 'main', 'inline' ],
    [ 'block-video-in-main', 'main', 'block' ],
  ] )( 'copy %s from %s', ( copyTestName, copyEditorFocus, contextType ) => {

    /*
     * for test purpose, only one section should inside the story
     * if editorFocus is note, only one note is required
     */
    const story = copyTests.find( ( item ) => item.name === copyTestName ).data;
    const { sectionsOrder } = story;
    const copiedSectionId = sectionsOrder[0];
    const copiedEditorStates = getEditorStates( {
      story,
      editorFocus: copyEditorFocus
    } );
    const clipboardContentState = getClipboardContentState( { story, editorFocus: copyEditorFocus } );
    const clipboard = clipboardContentState.getBlockMap();

    const {
      copiedData,
    } = processCopy( {
      editorFocus: copyEditorFocus,
      editorStates: copiedEditorStates,
      activeSection: {
        id: copiedSectionId
      },
      story,
      citations,
      clipboard
    } );

    test.each( testCases )( 'test paste to %s', ( pasteTestName, pasteEditorFocus ) => {

      /*
       * for test purpose, only one section should inside the story
       * if editorFocus is note, only one note is required
       * TODO: test copy with note or paste to note editor is not testable
       */

      const pasteInsideTest = pasteInsideTests.find( ( item ) => item.name === pasteTestName ).data;
      const {
        sections: pasteInsideSections,
        sectionsOrder: pasteInsideSectionsOrder
      } = pasteInsideTest;
      const { notes, notesOrder } = pasteInsideSections[pasteInsideSectionsOrder[0]];
      const pasteEditorStates = getEditorStates( {
        story: pasteInsideTest,
        isBackward: false,
        editorFocus: pasteEditorFocus
      } );
      const {
        resourcesToCreate,
        contextualizersToCreate,
        contextualizationsToCreate
      } = computePastedData( {
        copiedData,
        copiedResources: copiedData.copiedResources,
        editorFocus: pasteEditorFocus === 'main' ? 'main' : notesOrder[0],
        editorStates: pasteEditorStates,
        activeSection: {
          id: pasteInsideTest.sectionsOrder[0]
        },
        editor: null,
        notes,
        story
      } );
      expect( resourcesToCreate.length ).toEqual( 0 );
      if ( contextType === 'block' && pasteEditorFocus !== 'main' ) {
        expect( contextualizationsToCreate.length ).toEqual( 0 );
        expect( contextualizersToCreate.length ).toEqual( 0 );
      }
      else {
        expect( contextualizationsToCreate.length ).toEqual( 1 );
        expect( contextualizersToCreate.length ).toEqual( 1 );
      }
    } );
  } );
} );

