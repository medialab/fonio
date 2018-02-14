/**
 * This module provides utils related to the test and loading of assets' data
 * @module fonio/utils/assetsUtils
 */

import {
  get
} from 'superagent';

import Cite from 'citation-js';

/**
 * Checks whether a file is an image that can be loaded in base64 later on
 * todo: could be improved
 * @param {File} file - the file to check
 * @return {Promise} process - checking is wrapped in a promise for consistence matters
 */
export function fileIsAnImage(file) {
  return new Promise((resolve, reject) => {
    const validExtensions = ['gif', 'png', 'jpeg', 'jpg'];
    const extension = file.name.split('.').pop();
    if (validExtensions.indexOf(extension) > -1) {
      resolve(file);
    }
    else {
      reject();
    }
  });
}

/**
 * Checks whether a given url links toward a video service which is handled by the app
 * todo: could be improved
 * @param {string} url - the url to check
 * @return {Promise} process - checking is wrapped in a promise for consistence matters
 */
export function videoUrlIsValid(url) {
  return new Promise((resolve, reject) => {
    const validUrlParts = ['youtube', 'vimeo'];
    const hasMatch = validUrlParts.some(exp => url.match(exp) !== null);
    if (hasMatch) {
      resolve(url);
    }
    else {
      reject();
    }
  });
}

/**
 * Loads an image file in base64
 * todo: could be improved
 * @param {File} file - the file to load
 * @return {Promise} process - loading is wrapped in a promise for consistence matters
 */
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
      reader = undefined;
    };
    reader.onerror = (event) => {
      reject(event.target.error);
      reader = undefined;
    };
    reader.readAsDataURL(file);
  });
}

const youtubeRegexp = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/gi;
const vimeoRegexp = /^(https?\:\/\/)?(www\.)?(vimeo\.com)/gi;
/**
 * Retrieves the metadata associated with a given media resource from its source (youtube or vimeo only for now)
 * @param {string} url - the url to start from to know where to retrieve the metadata
 * @param {object} credentials - potential api keys to be used by the function
 * @return {Promise} process - loading is wrapped in a promise for consistence matters
 */
export function retrieveMediaMetadata (url, credentials = {}) {
  return new Promise((resolve) => {
    // case youtube
    if (url.match(youtubeRegexp)) {
      // must provide a youtube simple api key
      if (credentials.youtubeAPIKey) {
        let videoId = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
        if (videoId !== null) {
           videoId = videoId[1];
           // for a simple metadata retrieval we can use this route that includes the api key
            const endPoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${credentials.youtubeAPIKey}`;
            get(endPoint)
              .set('Accept', 'application/json')
              .redirects(2)
              .end((error, res) => {
                if (error) {
                  return resolve({url, metadata: {
                    videoUrl: url
                  }});
                }
                const info = res.body && res.body.items && res.body.items[0] && res.body.items[0].snippet;
                return resolve({
                  url,
                  metadata: {
                    description: info.description,
                    source: info.channelTitle + ` (youtube: ${url})`,
                    title: info.title,
                    videoUrl: url
                  }
                });
              });
        }
        else {
          return resolve({url, metadata: {
          videoUrl: url
        }});
        }
      }
      else {
        return resolve({url, metadata: {
          videoUrl: url
        }});
      }
    }
    // case vimeo: go through the oembed endpoint of vimeo api
    else if (url.match(vimeoRegexp)) {
      const endpoint = 'https://vimeo.com/api/oembed.json?url=' + url;
      get(endpoint)
        .set('Accept', 'application/json')
        .end((error, res) => {
          if (error) {
            return resolve({url, metadata: {
        videoUrl: url
      }});
          }
          const data = res.body;
          resolve({
            url,
            metadata: {
              source: data.author_name + ` (vimeo: ${url})`,
              title: data.title,
              description: data.description,
              videoUrl: url
            }
          });
        });
    }
    // default - do nothing
    else {
      return resolve({url, metadata: {
        videoUrl: url
      }});
    }
  });
}

/**
 * Converts bibtex data to csl-json in a secure way
 * (if not splitting all the refs in separate objects,
 * a single error blows the whole conversion process with citation-js.
 * This is a problem as for instance zotero bibTeX output
 * generates a lot of errors as it is not standard bibTeX).
 * @todo: comply to zotero-flavoured & mendeley-flavoured bibtex formatting
 * (see https://github.com/citation-style-language/schema/wiki/Data-Model-and-Mappings)
 * @param {string} str - input bibTeX-formatted string
 * @return {array} references - a list of csl-json formatted references
 */
export function parseBibTeXToCSLJSON (str) {
  // forcing references separation to parse a maximum of references, even with shitty formatting
  const refs = str.split('\n\n');
  return refs.reduce((result, ref) => {
    return [
      ...result,
      ...new Cite(ref).get({
        type: 'json',
        style: 'csl'
      })
    ];
  }, []);
}

/**
 * Retrieves metadata from the data of a resource, when possible
 * @param {object} data - the data of the resource
 * @param {string} assetType - the type of asset that is parsed
 * @return {object} metadata - information to merge with preexisting metadata
 */
export function inferMetadata(data, assetType) {
  switch (assetType) {
    case 'video':
      if (data.metadata) {
        return {...data.metadata};
      }
      return {
      };
    case 'data-presentation':
      return {...data.metadata};
    case 'image':
      let title = data && data.file && data.file.name && data.file.name.split('.');
      if (title) {
        title.pop();
        title = title.join('.');
      }
      return {
        title,
        mime: data && data.file && data.file.type
      };
    case 'embed':
    default:
      return {};
  }
}
