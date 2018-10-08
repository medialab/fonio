/**
 * This module provides unit tests for the assetsUtils module
 * @module fonio/utils/assetsUtils
 */
/* eslint no-unused-expressions : 0 */
import { expect } from 'chai';

import {
  videoUrlIsValid,
  fileIsAnImage,
  parseBibTeXToCSLJSON,
} from './assetsUtils';

describe( 'assetsUtils helpers', () => {
  describe( 'videoUrlIsValid', () => {

    const validUrls = [
      'http://youtu.be/cCnrX1w5luM',
      'http://youtube/cCnrX1w5luM',
      'www.youtube.com/cCnrX1w5luM',
      'youtube/cCnrX1w5luM',
      'youtu.be/cCnrX1w5luM',
      'https://vimeo/0930909',
      'http://vimeo/0930909'
    ];
    const invalidUrls = [
      '',
      'yourube.com/mlkjmlkj',
      'http://coucou.com'
    ];

    it( 'should accept valid video urls', async () => {
      await Promise.all(
        validUrls.map( async ( url ) => {
          const output = await videoUrlIsValid( url );
          expect( output ).to.be.a( 'string' );
        } )
      );
    } );

    it( 'should not accept invalid video urls', async () => {
      await Promise.all(
        invalidUrls.map( async ( url ) => {
          let output;
          try {
            output = await videoUrlIsValid( url );
          }
          catch ( e ) {
            expect( output ).to.be.undefined;
          }
        } )
      );
    } );
  } );

  describe( 'fileIsAnImage', () => {

    const validFileNames = [
      'test.png',
      'test.gif',
      'test.jpeg',
      'test.pdf.jpeg',
      'test.jpg'
    ];
    const invalidFileNames = [
      '',
      'text.txt'
    ];

    it( 'should accept valid image files', async () => {
      await Promise.all(
        validFileNames.map( async ( name ) => {
          const output = await fileIsAnImage( { name } );
          expect( output ).to.be.an( 'object' );
        } )
      );
    } );

    it( 'should not accept invalid image files', async () => {
      await Promise.all(
        invalidFileNames.map( async ( name ) => {
          let output;
          try {
            output = await fileIsAnImage( { name } );
          }
 catch ( e ) {
            expect( output ).to.be.undefined;
          }
        } )
      );
    } );
  } );

  describe( 'parseBibTeXToCSLJSON', () => {

    it( 'should parse valid bibTeX', () => {
      const output = parseBibTeXToCSLJSON( `
@article{Johnson,
        author = {Edgar G. Johnson and Alfred O. Nier},
        title = {Angular Aberrations in Sector Shaped 
        Electromagnetic Lenses for Focusing Beams of Charged Particles},
        journal = {Physical Review},
        volume = {91},
        number = {1},
        month = {jul},
        year = {1953}
}
      ` );
      expect( output ).to.be.an( 'array' );
      expect( output[0] ).to.be.an( 'object' );
    } );

    it( 'should split multiple bibTeX objects into several objects', () => {
      const output = parseBibTeXToCSLJSON( `
@article{Johnson,
        author = {Edgar G. Johnson and Alfred O. Nier},
        title = {Angular Aberrations in Sector Shaped 
        Electromagnetic Lenses for Focusing Beams of Charged Particles},
        journal = {Physical Review},
        volume = {91},
        number = {1},
        month = {jul},
        year = {1953}
}

@phdthesis{Zoran,
        author = {Zoran Racic},
        title = {\'Etude et essais du spectromètre à plasma {DYMIO}
  de la  mission {MARS 96}},
        publisher = {Université Pierre et Marie Curie},
        year = {1996}
}
      ` );
      expect( output ).to.be.an( 'array' );
      expect( output.length ).to.equal( 2 );
    } );

    it( 'should filter out invalid bibTeX data', () => {
       const output = parseBibTeXToCSLJSON( `
@article{Johnson,
        author = {Edgar G. Johnson and Alfred O. Nier},
        title = {Angular Aberrations in Sector Shaped 
        Electromagnetic Lenses for Focusing Beams of Charged Particles},
        journal = {Physical Review},
        volume = {91},
        number = {1},
        month {jul},
        year = {1953}
}
      ` );
      expect( output ).to.be.an( 'array' );
      expect( output ).to.be.empty;
    } );
    it( 'should return empty array if given empty string', () => {
       const output = parseBibTeXToCSLJSON( `
      ` );
      expect( output ).to.be.an( 'array' );
      expect( output ).to.be.empty;
    } );
    it( 'should return empty array if given invalid data', () => {
       const output = parseBibTeXToCSLJSON( `zebulon

        zebula

        zmlkqjs@çàmlkejbr

        @mlkjqsgmlkj{}` );
      expect( output ).to.be.an( 'array' );
      expect( output ).to.be.empty;
    } );
  } );

} );
