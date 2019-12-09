/**
 * This module provides a modal for warning user of demo version behaviour when leaving a story
 * @module fonio/components/DemoLeaveConfirmModal
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  ModalCard,
  Notification,
  Button,
  Title,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';

const DemoLeaveConfirmModal = ( {
  onConfirm,
  onCancel,
}, { t } ) => {
  const translate = translateNameSpacer( t, 'Components.DemoLeaveConfirmModal' );
  return (
    <ModalCard
      isActive
      onClose={ onCancel }
      headerContent={ translate( 'Returning to the demo home' ) }
      mainContent={
        <div>
          <Title isSize={ 4 }>
            {translate( 'As you are in the demonstration version, this means all the contents of this story will be deleted if you leave it.' )}
          </Title>
          <Notification isColor={ 'info' }>
            <p>{translate( 'Before leaving, you can retrieve a publishable version of your by clicking on the export button on the top right corner of the screen (you can also save it as a data file and reimport it later from the home page).' )}</p>
          </Notification>
          <p>
            {translate( 'So, are you ready to leave this test story and let it be deleted ?' )}
          </p>
        </div>
        }
      footerContent={ [
        <Button
          isFullWidth
          key={ 0 }
          onClick={ onCancel }
          isColor={ 'success' }
        >{translate( 'No, let me continue to edit this story' )}
        </Button>,
        <Button
          isFullWidth
          onClick={ onConfirm }
          key={ 1 }
          isColor={ 'warning' }
        >{translate( 'Yes, let this story go !' )}
        </Button>
            ] }
    />
    );
};

DemoLeaveConfirmModal.contextTypes = {
  t: PropTypes.func.isRequired,
};

export default DemoLeaveConfirmModal;
