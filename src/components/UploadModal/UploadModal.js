/**
 * This module provides a modal for displaying what is happening when uploading contents
 * @module fonio/components/UploadModal
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  ModalCard,
  Notification,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons/faExclamationCircle';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';

const UploadModal = ( {
  uploadStatus
}, { t } ) => {
  const translate = translateNameSpacer( t, 'Components.UploadModal' );
  return (
    <ModalCard
      isActive={ uploadStatus !== undefined }
      headerContent={ translate( 'Please wait...' ) }
      mainContent={
        <div>
          {uploadStatus &&
          <p>
            {uploadStatus.status === 'initializing' ?
              translate( 'Analyzing contents...' )
            : translate( 'Adding "{n}"', { n: uploadStatus.currentFileName } )}
          </p>
          }
          {
          uploadStatus && uploadStatus.errors && uploadStatus.errors.length > 0 &&
          <div style={ { marginTop: '2rem' } }>
            {
            uploadStatus.errors.map( ( error, errorIndex ) => (
              <Notification
                key={ errorIndex }
                isColor={ 'warning' }
              >
                <StretchedLayoutContainer isDirection={ 'horizontal' }>
                  <StretchedLayoutItem>
                    <FontAwesomeIcon icon={ faExclamationCircle } />
                  </StretchedLayoutItem>
                  <StretchedLayoutItem isFlex={ 1 }>
                    <span>
                      {
                      error.reason === 'too big' ?
                      translate( '"{f}" is too big', { f: error.fileName } )
                      : null
                    }
                    </span>
                  </StretchedLayoutItem>
                </StretchedLayoutContainer>
              </Notification>
            ) )
          }
          </div>
        }
        </div>
    }
    />
  );
};

UploadModal.contextTypes = {
  t: PropTypes.func,
};

export default UploadModal;
