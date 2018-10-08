/**
 * This module provides miscellaneous utils
 * @module fonio/utils/misc
 */
import trunc from 'unicode-byte-truncate';

export const abbrevString = ( str = '', maxLength = 10 ) => {
  if ( str.length > maxLength ) {
   return `${trunc( str, maxLength ) }...`;
  }
  return str;
};

export const splitPathnameForSockets = ( url ) => {
  const h = url.split( '//' );
  const p = h.slice( -1 )[0].split( '/' );

  return [
    ( h.length > 1 ? ( `${h[0] }//` ) : '' ) + p[0],
    p.slice( 1 ).filter( ( i ) => i )
  ];
};

export const bytesToBase64Length = ( bytes ) => bytes * ( 4 / 3 );
export const base64ToBytesLength = ( bytes ) => bytes / ( 4 / 3 );

export const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let tem, M = ua.match( /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i ) || [];
    if ( /trident/i.test( M[1] ) ) {
      tem = /\brv[ :]+(\d+)/g.exec( ua ) || [];
      return { name: 'IE ', version: ( tem[1] || '' ) };
    }
    if ( /edge/gi.test( ua ) ) {
      return {
        name: 'Edge',
        version: 'unknown',
      };
    }
    if ( M[1] === 'Chrome' ) {
      tem = ua.match( /\bOPR\/(\d+)/ );
      if ( tem != null ) { /* eslint eqeqeq : 0 */
          return { name: 'Opera', version: tem[1] };
      }
    }
    M = M[2] ? [ M[1], M[2] ] : [ navigator.appName, navigator.appVersion, '-?' ];
    if ( ( tem = ua.match( /version\/(\d+)/i ) ) != null ) { /* eslint eqeqeq : 0 */
      M.splice( 1, 1, tem[1] );
    }
    return {
      name: M[0],
      version: M[1]
    };
 };

export const computeSectionFirstWords = ( section, maxLength = 100 ) => {
  if ( section.contents
      && section.contents.blocks
      && section.contents.blocks[0]
      && section.contents.blocks[0].text
  ) {
    return section.contents.blocks[0].text.length > maxLength ?
      `${section.contents.blocks[0].text.substr( 0, maxLength )}...`
      :
      section.contents.blocks[0].text;
  }
  return '';
};

export const silentEvent = ( event ) => {
  if ( event ) {
    event.stopPropagation();
    event.preventDefault();
  }
};
