/**
 * This module provides unit tests for the fileLoader module
 * @module fonio/utils/fileLoader
 */
import { expect } from 'chai';

import {
  validateFileExtensionForVisType
} from './fileLoader';

describe( 'fileLoader helpers', () => {
  describe( 'validateFileExtensionForVisType', () => {
    const visualizationModel = {
      acceptedFileExtensions: [ 'csv', 'tsv', 'dsv' ]
    };
    const validFileNames = [ 'myfile.csv', 'myfile.tsv', 'myfile.dsv', 'myfile.doc.csv' ];
    const invalidFileNames = [ '', 'myfile', 'myfile_csv', 'myfile.csv.psd' ];

    it( 'should accept valid extensions', () => {
      validFileNames.forEach( ( fileName ) => {
        const valid = validateFileExtensionForVisType( fileName, visualizationModel );
        return expect( valid ).to.be.true;
      } );
    } );

    it( 'should not accept invalid extensions', () => {
      invalidFileNames.forEach( ( fileName ) => {
        const valid = validateFileExtensionForVisType( fileName, visualizationModel );
        return expect( valid ).to.be.false;
      } );
    } );
  } );
} );
