/* eslint no-console: 0 */
/**
 * Fonio Configuration Module
 * ===========================
 *
 * Module exporting the client app's configuration.
 *
 * IMPORTANT: the FONIO_CONFIG is a global variable which is:
 *   `dev`: injected by webpack.DefinePlugin
 *   `prod`: a global variable templated in a script tag
 */
const CONFIG = typeof FONIO_CONFIG !== 'undefined' ? FONIO_CONFIG : {};

if (!Object.keys(CONFIG).length)
  console.warn('WARNING: FONIO_CONFIG is absent.');

CONFIG.restUrl = CONFIG.apiUrl + '/api';

export default CONFIG;
