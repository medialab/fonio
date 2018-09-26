/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';

import {
  ModalCard,
  Button,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */

import { getResourceTitle } from '../../helpers/resourcesUtils';
import { translateNameSpacer } from '../../helpers/translateUtils';

const ConfirmToDeleteModal = ( {
  onClose,
  onDeleteConfirm,
  id,
  story,
  deleteType,
  isActive,
  isDisabled = false
}, { t } ) => {

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Components.ConfirmToDeleteModal' );

  /**
   * Computed variables
   */
  let message;
  let citedContext;
  if ( deleteType === 'section' ) {
    message = ( story && story.sections[id] ) ? translate(
      'Are you sure you want to delete the section "{s}" ? All its content will be lost without possible recovery.',
      {
        s: story.sections[id].metadata.title
      }
    ) : translate( 'Are you sure you want to delete this section ?' );
  }
  else {
    const { contextualizations } = story;
    citedContext = Object.keys( contextualizations )
                  .map( ( contextId ) => contextualizations[contextId] )
                  .filter( ( d ) => d.resourceId === id );

    message = ( story && story.resources[id] ) ? translate(
      'Are you sure you want to delete the resource "{s}" ?',
      {
        s: getResourceTitle( story.resources[id] )
      }
    ) : translate( 'Are you sure you want to delete this resource ?' );
  }

  return (
    <ModalCard
      isActive={ isActive }
      headerContent={ deleteType === 'section' ? translate( 'Delete Section' ) : translate( 'Delete Resource' ) }
      onClose={ onClose }
      mainContent={
        <div>
          {deleteType === 'resource' && citedContext.length > 0 &&
          <div>
            {translate( [ 'You will destroy one item mention in your content if you delete this item.', 'You will destroy {n} item mentions in your content if your delete this item.', 'n' ],
                          { n: citedContext.length } )}
          </div>}
          <div>{message}</div>
        </div>
      }
      footerContent={ [
        <Button
          type={ 'submit' }
          isFullWidth
          key={ 0 }
          onClick={ onDeleteConfirm }
          isDisabled={ isDisabled }
          isColor={ 'danger' }
        >{translate( 'Delete' )}
        </Button>,
        <Button
          onClick={ onClose }
          isFullWidth
          key={ 1 }
          isColor={ 'warning' }
        >{translate( 'Cancel' )}
        </Button>,
      ] }
    />
  );
};

ConfirmToDeleteModal.contextTypes = {
  t: PropTypes.func,
};

export default ConfirmToDeleteModal;

