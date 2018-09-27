/**
 * This module provides a modal for confirm the deletion of several resources
 * @module fonio/features/LibraryView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import {
  ModalCard,
  Button
} from 'quinoa-design-library/components';

const ConfirmBatchDeleteModal = ( {
  translate,
  isActive,
  actualResourcesPromptedToDelete,
  resourcesPromptedToDelete,
  endangeredContextualizationsLength,
  onDelete,
  onCancel
} ) => (
  <ModalCard
    isActive={ isActive }
    headerContent={ translate( [ 'Delete an item', 'Delete {n} items', 'n' ], { n: actualResourcesPromptedToDelete.length } ) }
    onClose={ onCancel }
    mainContent={
      <div>
        {
          actualResourcesPromptedToDelete.length !== resourcesPromptedToDelete.length &&
          <p>
            {
              translate( '{x} of {y} of the resources you selected cannot be deleted now because they are used by another author.', { x: resourcesPromptedToDelete.length - actualResourcesPromptedToDelete.length, y: resourcesPromptedToDelete.length } )
            }
          </p>
        }
        {endangeredContextualizationsLength > 0 &&
        <p>{
            translate( [
              'You will destroy one item mention in your content if you delete these items.',
              'You will destroy {n} item mentions in your content if your delete these items.',
              'n'
              ],
            { n: endangeredContextualizationsLength } )}
        </p>
        }
        <p>
          {translate( [ 'Are you sure you want to delete this item ?', 'Are you sure you want to delete these items ?', 'n' ], { n: resourcesPromptedToDelete.length } )}
        </p>
      </div>
    }
    footerContent={ [
      <Button
        type={ 'submit' }
        isFullWidth
        key={ 0 }
        onClick={ onDelete }
        isColor={ 'danger' }
      >{translate( 'Delete' )}
      </Button>,
      <Button
        onClick={ onCancel }
        isFullWidth
        key={ 1 }
        isColor={ 'warning' }
      >{translate( 'Cancel' )}
      </Button>,
    ] }
  />
);

export default ConfirmBatchDeleteModal;
