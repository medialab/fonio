/**
 * This module provides unit tests for the assetsUtils module
 * @module fonio/helpers/clipboardUtils/handleCopy
 * @funciton computeCopiedData()
 * @param {string} editorFocus
 * @param {object} editorStates with {immutable} editorState
 * @param {object} story
 */

import expect from 'expect';
import {
  getEditorStates,
  getClipboardContentState
} from './__mocks__/services.js';
import copyTests from './__mocks__/copyTests';
import {
  computeCopiedData,
  processCopy
} from './handleCopy';

const testCases = copyTests.map( ( item ) => {
  return [ item.name, item.editorFocus ];
} );

describe( 'test for handleCopy', () => {
  describe( 'test computeCopiedData()', () => {
    describe.each( testCases )( 'test copy %s from %s', ( testName, editorFocus ) => {

      /*
       * for test purpose, only one section should inside the story
       * if editorFocus is note, only one note is required
       */
      const story = copyTests.find( ( item ) => item.name === testName ).data;
      const {
        sections,
        sectionsOrder,
        contextualizations,
        contextualizers,
        resources
      } = story;
      const { notes, notesOrder } = sections[sectionsOrder[0]];
      test.each( [
        [ 'forward copy', false ],
        [ 'backward copy', true ]
      ] )( 'test %s', ( t, isBackward ) => {

        const editorStates = getEditorStates( {
          story,
          isBackward,
          editorFocus
        } );
        const copiedEditor = {
          editorFocus: editorFocus === 'main' ? 'main' : notesOrder[0],
          editorStates,
          activeSection: {
            id: story.sectionsOrder[0]
          },
          story,
        };
        const {
          copiedNotes,
          copiedContextualizations,
          copiedContextualizers,
          copiedResources,
        } = computeCopiedData( copiedEditor );
        if ( copiedNotes.length > 0 ) {
          expect( copiedNotes.length ).toEqual( Object.keys( notes ).length );
          copiedNotes.forEach( ( note ) => {
            const copiedContents = note.contents;
            expect( notes[note.id] ).toBeDefined();
            expect( copiedContents ).toEqual( notes[note.id].contents );
          } );
        }
        copiedContextualizations.forEach( ( item ) => {
          expect( contextualizations[item.id] ).toBeDefined();
          expect( item ).toEqual( contextualizations[item.id] );
        } );
        copiedContextualizers.forEach( ( item ) => {
          expect( contextualizers[item.id] ).toBeDefined();
          expect( item ).toEqual( contextualizers[item.id] );
        } );
        copiedResources.forEach( ( item ) => {
          expect( resources[item.id] ).toBeDefined();
          expect( item ).toEqual( resources[item.id] );
        } );
      } );
    } );
  } );

  describe( 'test processCopy()', () => {
    const citations = {
      citationItems: {},
      citationData: []
    };

    test.each( testCases )( 'test process %s from %s', ( testName, editorFocus ) => {
      const story = copyTests.find( ( item ) => item.name === testName ).data;
      const { sections, sectionsOrder } = story;

      /*
       * for test purpose, only one section should inside the story
       * if editorFocus is note, only one note is required
       */

      const activeSectionId = sectionsOrder[0];
      const { notesOrder } = sections[activeSectionId];

      const editorStates = getEditorStates( {
        story,
        editorFocus
      } );
      const clipboardContentState = getClipboardContentState( { story, editorFocus } );
      const clipboard = clipboardContentState.getBlockMap();

      const {
        copiedData,
        clipboardPlainText,
      } = processCopy( {
        editorFocus: editorFocus === 'main' ? 'main' : notesOrder[0],
        editorStates,
        activeSection: {
          id: activeSectionId
        },
        story,
        citations,
        clipboard
      } );
      const expectClipboardPlainText = clipboardContentState.getPlainText();
      expect( copiedData ).toBeDefined();
      expect( clipboardPlainText ).toEqual( expectClipboardPlainText );
    } );
  } );
} );
