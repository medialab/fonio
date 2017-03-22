/**
 * This module helps for processes related to the exports of a presentation
 * @module fonio/utils/projectBundler
 */
import {post} from 'superagent';
import {serverUrl} from '../../secrets';

/**
 * Prepares a presentation data for a clean version to export
 * @param {object} presentation - the input data to clean
 * @return {object} newPresentation - the cleaned presentation
 */
export function cleanPresentationForExport(presentation) {
  return {
    ...presentation,
    slides: Object.keys(presentation.slides).reduce((slides, id) => {
      const slide = presentation.slides[id];
      slide.id = id;
      delete slide.draft;
      return {
        ...slides,
        [id]: slide
      };
    }, {})
  };
}

/*
 * Wraps a server call for rendering a presentation as all-in-one html presentation file
 * @param {object} presentation - the presentation to bundle
 * @param {function} callback
 */
export function bundleProjectAsHtml (presentation, callback) {
  post(serverUrl + '/render-presentation')
    .send(cleanPresentationForExport(presentation))
    .end((err, response) => callback(err, response && response.text));
}
/*
 * Cleans and serializes a presentation representation
 * @param {object} presentation - the presentation to bundle
 * @return {string} result - the resulting serialized presentation
 */
export function bundleProjectAsJSON (presentation) {
  return JSON.stringify(cleanPresentationForExport(presentation), null, 2);
}
