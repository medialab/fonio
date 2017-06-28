import {
  get
} from 'superagent';

import {serverUrl} from '../../secrets';


export const getCitationStylesListFromServer = () => {
  return new Promise((resolve, reject) => {
    const endPoint = serverUrl + '/citation-styles/';
    get(endPoint)
    .end((error, res) => {
      if (error) {
        reject(error);
      }
 else {
        resolve(res.body);
      }
    });
  });
};


export const getCitationStyleFromServer = (styleId) => {
  return new Promise((resolve, reject) => {
    const endPoint = serverUrl + '/citation-styles/' + styleId;
    get(endPoint)
    .end((error, res) => {
      if (error) {
        reject(error);
      }
 else {
        resolve(res.body);
      }
    });
  });
};

export const getCitationLocalesListFromServer = () => {
  return new Promise((resolve, reject) => {
    const endPoint = serverUrl + '/citation-locales/';
    get(endPoint)
    .end((error, res) => {
      if (error) {
        reject(error);
      }
 else {
        resolve(res.body);
      }
    });
  });
};


export const getCitationLocaleFromServer = (localeId) => {
  return new Promise((resolve, reject) => {
    const endPoint = serverUrl + '/citation-locales/' + localeId;
    get(endPoint)
    .end((error, res) => {
      if (error) {
        reject(error);
      }
 else {
        resolve(res.body);
      }
    });
  });
};
