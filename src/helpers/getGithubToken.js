/**
 * This module helps to get a token from github oAuth service
 * @module fonio/utils/getGithubToken
 */
import {post} from 'superagent';

import {githubAPIClientId, serverUrl, appUrl} from '../../secrets';

/**
 * @return {promise} promise - the promise wrapping the attempt
 */
export default function getGithubToken () {
  return new Promise((resolve, reject) => {
    const loginUrl = 'https://github.com' +
    '/login/oauth/authorize' +
    '?client_id=' + githubAPIClientId +
    '&scope=gist&redirect_url=' + appUrl;
    // open login form
    window.open(loginUrl);
    // get code from oauth response
    window.addEventListener('message', function (event) {
      let code = event.data;
      if (typeof code === 'string') {
        // clean the code
        code = code.split('&')[0];
        // exchange the code for a token
        post(serverUrl + '/oauth-proxy/fonio')
        .set('Accept', 'application/json')
        .send({code})
        .end((err, response) => {
          if (err) {
            reject(err);
          }
          else {
            try {
              const jsonResp = JSON.parse(response.text);
              const accessToken = jsonResp.access_token;
              resolve(accessToken);
            }
            catch (e) {
              reject(e);
            }
          }
        });
      }
    });
  });
}
