/**
 * This module helps for processes related to the exports of a story
 * @module fonio/utils/projectBundler
 */
import {post} from 'superagent';
import {serverUrl} from '../../secrets';
import {
  convertToRaw
} from 'draft-js';

/**
 * Prepares a story data for a clean version to export
 * @param {object} story - the input data to clean
 * @return {object} newStory - the cleaned story
 */
export function cleanStoryForExport(story) {
  return {
    ...story,
    content: convertToRaw(story.content.getCurrentContent())
  };
}

/*
 * Wraps a server call for rendering a story as all-in-one html story file
 * @param {object} story - the story to bundle
 * @param {function} callback
 */
export function bundleProjectAsHtml (story, callback) {
  post(serverUrl + '/render-story')
    .send(cleanStoryForExport(story))
    .end((err, response) => callback(err, response && response.text));
}
/*
 * Cleans and serializes a story representation
 * @param {object} story - the story to bundle
 * @return {string} result - the resulting serialized story
 */
export function bundleProjectAsJSON (story) {
  return JSON.stringify(cleanStoryForExport(story), null, 2);
}
