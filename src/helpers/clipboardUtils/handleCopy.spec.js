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
  describe( 'test for computeCopiedData()', () => {
    describe( 'test copy content with contextualization from main editor', () => {
      describe.each( [
        'copy-inline-bib-from-main',
        'copy-inline-glossary-from-main',
    ] )( 'test %s', ( testName ) => {
        const story = stories.find( ( item ) => item.name === testName ).data;
        test.each( [
          [ 'forward copy', false ],
          [ 'backward copy', true ]
        ] )( 'test %s', ( testName, isBackward ) => {
          const editorStates = services.getEditorStates( {
            story,
            isBackward
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
    describe( 'test copy content with note from main editor', () => {
      describe.each( [
        'copy-note-from-main',
    ] )( 'test %s', ( testName ) => {
        const story = stories.find( ( item ) => item.name === testName ).data;
        test.each( [
          [ 'forward copy', false ],
          [ 'backward copy', true ]
        ] )( 'test %s', ( testName, isBackward ) => {
          const editorStates = services.getEditorStates( {
            story,
            isBackward
          } );
          const copiedEditor = {
            editorFocus: 'main',
            editorStates,
            activeSection: {
              id: story.sectionsOrder[0]
            },
            story,
          };
          const { sections, sectionsOrder } = story;
          const { notes, notesOrder } = sections[sectionsOrder[0]];
          const { contents } = notes[notesOrder[0]];

          const {
            copiedNotes
          } = computeCopiedData( copiedEditor );
          expect( copiedNotes.length ).toEqual( 1 );
          expect( copiedNotes[0].contents ).toEqual( contents );
        } );
      } );
    } );
  } );

} );
