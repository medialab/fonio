/**
 * Fonio Application Endpoint
 * ======================================
 *
 * Rendering the application.
 * @module fonio
 */
import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import I18n from 'redux-i18n';

import configureStore from './redux/configureStore';
import Application from './Application';

import translations from './translations/index.js';

let CurrentApplication = Application;

const initialState = {};

const store = configureStore(initialState);
window.store = store;

const mountNode = document.getElementById('mount');

const initialLang = localStorage.getItem('fonio-lang') || navigator.language || navigator.userLanguage; 

/**
 * Mounts the application to the given mount node
 */
export function renderApplication() {
  const group = (
    <Provider store={store}>
      <I18n translations={translations} initialLang={initialLang || 'en-GB'}>
        <CurrentApplication />
      </I18n>
    </Provider>
  );
  render(group, mountNode);
}

renderApplication();

/**
 * Hot-reloading.
 */
if (module.hot) {
  module.hot.accept('./Application', function() {
    CurrentApplication = require('./Application').default;
    renderApplication();
  });
}
