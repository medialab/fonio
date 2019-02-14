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
import stories from './__mocks__/stories';
import {
  computeCopiedData
} from './handleCopy';

describe( 'test for handleCopy', () => {
  describe( 'test computeCopiedData()', () => {
    describe.each( [
      [ 'inline-bib-in-main', 'main' ],
      [ 'inline-glossary-in-main', 'main' ],
      [ 'block-video-in-main', 'main' ],
      [ 'inline-glossary-in-note', 'note' ],
      [ 'inline-bib-in-note', 'note' ],
      [ 'single-note-in-main', 'main' ],
      [ 'inline-bib-in-note', 'main' ],
      [ 'multiple-note-in-main', 'main' ]
  ] )( 'test copy %s from %s', ( testName, editorFocus ) => {
      const story = stories.find( ( item ) => item.name === testName ).data;
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

        const editorStates = services.getEditorStates( {
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
} );
