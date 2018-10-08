/**
 * This module helps to load files from app server or user own file system
 * @module fonio/utils/fileLoader
 */

/**
 * Validates whether the extension of a file is valid against its visualization model
 * @param {string} fileName - the name of the file to validate
 * @param {object} visualizationModel - the model of the visualization to validate the filename against
 * @return {boolean} isValid - whether the filename is valid
 */
export function validateFileExtensionForVisType ( fileName = '', visualizationModel ) {
  const fileExtension = fileName.split( '.' ).pop();
  return visualizationModel.acceptedFileExtensions.find( ( ext ) => ext === fileExtension ) !== undefined;
}

/**
 * Reads the raw string content of a file from user file system
 * @param {File} fileToRead - the file to read
 * @param {function} callback
 */
export function getFileAsText( file ) {
  return new Promise( ( resolve, reject ) => {
    let reader = new FileReader();
    reader.onload = ( event ) => {
      resolve( event.target.result );
      reader = undefined;
    };
    reader.onerror = ( event ) => {
      reject( event.target.error );
      reader = undefined;
    };
    return reader.readAsText( file );
  } );
}
