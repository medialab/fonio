/**
 * This module helps for processes related to the exports of a story
 * @module fonio/utils/projectBundler
 */
import {
  convertFromRaw
} from 'draft-js';

import { stateToMarkdown } from 'draft-js-export-markdown';

/**
 * Prepares a story data for a clean version to export
 * @param {object} story - the input data to clean
 * @return {object} newStory - the cleaned story
 */
export function cleanStoryForExport( story ) {
  return story;
}

/**
 * Consumes story data to produce a representation in markdown syntax
 * @todo: for now this does not handle assets, it should be broadly improved to do that
 * @param {object} story - the story to consume
 * @return {string} markdown - the markdown representation of the story
 */
export function convertStoryToMarkdown( story ) {
  const header = `${story.metadata.title}
====
${story.metadata.authors.join( ', ' )}
---
`;
  return header + story.sectionsOrder.map( ( id ) => {
    const content = convertFromRaw( story.sections[id].contents );
    return stateToMarkdown( content );
  } ).join( '\n \n' );
}

/**
 * Cleans and serializes a story representation
 * @param {object} story - the story to bundle
 * @return {string} result - the resulting serialized story
 */
export function bundleProjectAsJSON ( story ) {
  return JSON.stringify( cleanStoryForExport( story ) );
}
