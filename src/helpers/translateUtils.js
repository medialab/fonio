/**
 * This module provide helpers to handle translations in the app
 * @module bulgur/utils/translateUtils
 */

/**
 * Automatically functions a translate function
 * @param {function} translateFn - the translate function to namespace
 * @param {string} nameSpace - the namespace to use
 * @return {function} translateFnBis - a new function using the namespace
 */
export const translateNameSpacer = ( translateFn, nameSpace ) => {
  return function( key, props ) {
    if ( Array.isArray( key ) ) {
      return translateFn( key.map( ( k ) => {
        if ( k.length > 1 ) {
          return `${nameSpace }.${ k}`;
        }
        return k;
      } ), props );
    }
    return translateFn( `${nameSpace }.${ key}`, props );
  };
};
