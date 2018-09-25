import React from 'react';
import PropTypes from 'prop-types';

import {
  ModalCard,
  Notification,
  Icon,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

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
                    <Icon>
                      <i className={ 'fa fa-exclamation-circle' } />
                    </Icon>
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
