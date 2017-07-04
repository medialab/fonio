/**
 * This module helps to export a story to the gist service
 * @module fonio/utils/gistExporter
 */
import GitHub from 'github-api';

import getGithubToken from './getGithubToken';

/**
 * @param {string} htmlContent - the content to publish to the index.html file of the gist
 * @param {object} JSONbundle - the JSON restory of the story to publish to project.json file of the gist
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
        description: (JSONbundle && JSONbundle.metadata && JSONbundle.metadata.title) || 'quinoa story',
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
      let gist = gh.getGist(gistId);
      // gistId is specified ==> update routine
      if (gistId) {
        dispatch({
          type: statusActionName,
          log: 'updating gist',
          status: 'processing'
        });
        gist.update(gistContent)
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
      }
      // create routine
      else {
        dispatch({
          type: statusActionName,
          log: 'creating gist',
          status: 'processing'
        });
        gist.create(gistContent)
          .then(() => {
            return gist.read();
          })
          .then(response => {
            const gistData = response.data;
            // const ownerName = gistData.owner.login;
            const gistUrl = gistData.html_url;
            // as this is a new story, reuploading the story with correct gist id
            const newGistContent = {
              ...gistContent,
              files: {
                ...gistContent.files,
                'project.json': {
                  content: JSON.stringify({
                    ...JSONbundle,
                    metadata: {
                      ...JSONbundle.metadata,
                      gistUrl,
                      gistId: gistData.id
                    }
                  }, null, 2)
                }
              }
            };
            gist = gh.getGist(gistData.id);
            gist.update(newGistContent)
              .then(() => {
                return gist.read();
              })
              .then(() => {
                const results = {
                  gistUrl,
                  gistId: gistData.id,
                  gist
                };
                return resolve(results);
              });
        })
        .catch(reject);
      }
    })
    .catch(reject);
  });
}
