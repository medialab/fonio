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
    [ 'single-note-in-main', 'main', 'note' ],
    [ 'inline-glossary-in-note', 'main', 'note' ],
    [ 'inline-bib-in-note', 'main', 'note' ],
    [ 'multiple-note-in-main', 'main', 'note' ],
  ] )( 'copy %s from %s', ( copyTestName, copyEditorFocus, entityType ) => {

    /*
     * for test purpose, only one section should be inside the story
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
    const originalCopiedData = { ...copiedData };
    describe.each( testCases )( 'test paste to %s', ( pasteTestName, pasteEditorFocus ) => {

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
      test.each( [
        [ 'new section of same story', false ],
        [ 'new section of new story', true ]
      ] )( 'test paste to a %s', ( t, isNewStory ) => {
        const newStory = {
          resources: {}
        };

        const {
          resourcesToCreate,
          contextualizersToCreate,
          contextualizationsToCreate,
          newSection
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
          story: isNewStory ? newStory : story
        } );
        const { contents } = newSection;
        if ( pasteEditorFocus === 'main' ) {
          if ( contextualizationsToCreate.length > 0 && entityType !== 'note' ) {

            /**
             * copy block/inline context to main editor cases
             */
            expect( contextualizationsToCreate.length ).toEqual( originalCopiedData.copiedContextualizations.length );
            expect( contextualizersToCreate.length ).toEqual( originalCopiedData.copiedContextualizers.length );
            expect( contextualizationsToCreate ).not.toEqual( originalCopiedData.copiedContextualizations );
            expect( contextualizersToCreate ).not.toEqual( originalCopiedData.copiedContextualizers );

            const assetsIds = Object.keys( contents.entityMap ).map( ( entityKey ) => {
              const entity = contents.entityMap[entityKey];
              if ( ( entity.type === 'BLOCK_ASSET' || entity.type === 'INLINE_ASSET' ) && entity.data && entity.data.asset && entity.data.asset.id ) {
                return entity.data.asset.id;
              }
            } );

            expect( assetsIds.sort() ).toEqual( contextualizationsToCreate.map( ( item ) => item.id ).sort() );
          }
          else if ( entityType === 'note' ) {

            /**
             * copy note point (w/o asset) to main editor case
             */

            const assetsIds = Object.keys( contents.entityMap ).map( ( entityKey ) => {
              const entity = contents.entityMap[entityKey];
              if ( entity.data && entity.data && entity.data.noteId ) {
                return entity.data.noteId;
              }
            } );
            expect( assetsIds.length ).toEqual( originalCopiedData.copiedNotes.length );
            if ( contextualizationsToCreate.length > 0 ) {
              assetsIds.forEach( ( id ) => {
                const noteContents = newSection.notes[id].contents;
                const noteAssetIds = Object.keys( noteContents.entityMap ).map( ( entityKey ) => {
                  const entity = noteContents.entityMap[entityKey];
                  if ( ( entity.type === 'BLOCK_ASSET' || entity.type === 'INLINE_ASSET' ) && entity.data && entity.data.asset && entity.data.asset.id ) {
                    return entity.data.asset.id;
                  }
                } );
                expect( contextualizationsToCreate.map( ( item ) => item.id ) ).toEqual( expect.arrayContaining( noteAssetIds ) );
              } );
            }
          }
        }
        else {

          /**
           * copy block context to note editor case
           */
          if ( entityType === 'block' ) {
            expect( contextualizationsToCreate.length ).toEqual( 0 );
            expect( contextualizersToCreate.length ).toEqual( 0 );
          }

          /**
           * TODO: copy inline to note editor case
           */
          // else if ( entityType === 'inline' ) {}

          /**
           * TODO: copy note point to note editor case
           */
          // else if ( entityType === 'note' ) {}
        }
        const expectedResourcesToCreate = isNewStory ? copiedData.copiedResources.length : 0;
        expect( resourcesToCreate.length ).toEqual( expectedResourcesToCreate );
      } );
    } );
  } );
} );

