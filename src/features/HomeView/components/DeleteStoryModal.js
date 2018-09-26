import React from 'react';
import PropTypes from 'prop-types';

import { translateNameSpacer } from '../../../helpers/translateUtils';

import {
  Button,
  Content,
  ModalCard,
  Field,
  Help
} from 'quinoa-design-library/components/';

import { Form } from 'react-form';

import PasswordInput from '../../../components/PasswordInput';
import ExplainedLabel from '../../../components/ExplainedLabel';

const DeleteStoryModal = ( {
  loginStatus,
  deleteStatus,
  onSubmitPassword,
  onCancel
}, {
  t
} ) => {
  const translate = translateNameSpacer( t, 'Components.DeleteStoryModal' );

  const handleSubmitForm = ( values ) => {
    onSubmitPassword( values.password );
  };

  return (
    <Form onSubmit={ handleSubmitForm }>
      {
        ( formApi ) => {
          const handleSubmit = formApi.submitForm;
          return (
            <form
              onSubmit={ handleSubmit }
              className={ 'fonio-form' }
            >
              <ModalCard
                isActive
                headerContent={ translate( 'Delete a story' ) }
                onClose={ onCancel }
                mainContent={
                  <Field>
                    <Content>
                      {translate( 'Deleting a story cannot be undone. Are you sure ?' )}
                    </Content>
                    <ExplainedLabel
                      title={ translate( 'Enter password of the story' ) }
                      explanation={ translate( 'Explanation about the password' ) }
                    />
                    <PasswordInput id={ 'password' } />
                    {loginStatus === 'processing' && <Help>{translate( 'Submitting password' )}</Help>}
                    {loginStatus === 'fail' && <Help isColor={ 'danger' }>{translate( 'Password is not valid' )}</Help>}
                    {deleteStatus === 'processing' && <Help>{translate( 'Deleting Story' )}</Help>}
                    {deleteStatus === 'fail' && <Help isColor={ 'danger' }>{translate( 'Story could not be deleted' )}</Help>}
                  </Field>
                      }
                footerContent={ [
                  <Button
                    type={ 'submit' }
                    isFullWidth
                    key={ 0 }
                    isColor={ 'danger' }
                  >{translate( 'Delete' )}
                  </Button>,
                  <Button
                    isFullWidth
                    key={ 2 }
                    onClick={ onCancel }
                  >
                    {translate( 'Cancel' )}
                  </Button>
                    ] }
              />
            </form>
                );
}
      }
    </Form>
  );
};

DeleteStoryModal.propTypes = {
  loginStatus: PropTypes.string,
  onCancel: PropTypes.func,
  onDeleteStory: PropTypes.func,
};

DeleteStoryModal.contextTypes = {
  t: PropTypes.func
};

export default DeleteStoryModal;
