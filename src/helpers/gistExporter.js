/**
 * This module helps to export a presenetation to the gist service
 * @module fonio/utils/gistExporter
 */
import GitHub from 'github-api';

import getGithubToken from './getGithubToken';

/**
 * @param {string} htmlContent - the content to publish to the index.html file of the gist
 * @param {object} JSONbundle - the JSON representation of the presentation to publish to project.json file of the gist
 * @param {function} dispatch - the function to use to dispatch actions to the redux logic in which the helper is called
 * @param {string} statusActionName - the name base of the actions to dispatch to redux
 * @param {string} gistId - (optional - in update use cases) the id of the gist to update
 * @return {promise} promise - the promise wrapping the attempt to publish to gist
 */
export default function publishGist(htmlContent = '', JSONbundle = {}, dispatch, statusActionName, gistId) {
  return new Promise((resolve, reject) => {
    dispatch({
      type: statusActionName,
      log: 'connecting to github',
      status: 'processing'
    });

    getGithubToken()
    .then(token => {
      const gh = new GitHub({
         token
      });
      const gistContent = {
        description: (JSONbundle && JSONbundle.metadata && JSONbundle.metadata.title) || 'quinoa presentation',
        public: true,
        files: {
          'index.html': {
            content: htmlContent
          },
          'project.json': {
            content: JSON.stringify(JSONbundle, null, 2)
          }
        }
      };
      if (gistId) {
        dispatch({
          type: statusActionName,
          log: 'updating gist',
          status: 'processing'
        });
      }
      else {
        dispatch({
          type: statusActionName,
          log: 'creating gist',
          status: 'processing'
        });
      }
      const gist = gh.getGist(gistId);

      gist.create(gistContent)
        .then(() => {
          return gist.read();
        })
        .then(response => {
          const gistData = response.data;
          // const ownerName = gistData.owner.login;
          const gistUrl = gistData.html_url;
          const results = {
            gistUrl,
            gistId: gistData.id,
            gist
          };
          return resolve(results);
        })
        .catch(reject);
    })
    .catch(reject);
  });
}
