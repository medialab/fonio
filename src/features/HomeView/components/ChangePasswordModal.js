import React from 'react';
import PropTypes from 'prop-types';

import { translateNameSpacer } from '../../../helpers/translateUtils';

import {
  Button,
  ModalCard,
  Field,
  Label,
  Help
} from 'quinoa-design-library/components/';

import { Form } from 'react-form';

import PasswordInput from '../../../components/PasswordInput';
import ExplainedLabel from '../../../components/ExplainedLabel';

const ChangePasswordModal = ( {
  changePasswordStatus,
  onChangePassword,
  onCancel
}, {
  t
} ) => {
  const translate = translateNameSpacer( t, 'Components.ChangePasswordModal' );

  const errorValidator = ( values ) => {
    return {
      oldPassword: !values.oldPassword ? translate( 'Old password is required' ) : null,
      newPassword: !values.newPassword || values.newPassword.length < 6 ? translate( 'Password should be at least 6 characters' ) : null,
      confirmPassword: values.newPassword !== values.confirmPassword ? translate( 'password does not match' ) : null
    };
  };
  const handleSubmitForm = ( values ) => {
    onChangePassword( values.oldPassword, values.newPassword );
  };

  return (
    <Form
      onSubmit={ handleSubmitForm }
      validate={ errorValidator }
    >
      {
        ( formApi ) => {
          const handleSubmit = formApi.submitForm;
          return (
            <form
              onSubmit={ handleSubmit }
              id={ 'login-form' }
              className={ 'fonio-form' }
            >
              <ModalCard
                isActive
                headerContent={ translate( 'Change password' ) }
                onClose={ onCancel }
                mainContent={
                  <Field>
                    <ExplainedLabel
                      title={ translate( 'Old password' ) }
                      explanation={ translate( 'Explanation about the password' ) }
                    />
                    <PasswordInput id={ 'oldPassword' } />
                    {
                              formApi.touched.oldPassword && formApi.errors && formApi.errors.oldPassword &&
                                <Help isColor={ 'danger' }>{formApi.errors.oldPassword}</Help>
                            }
                    <Label>
                      {translate( 'New password' )}
                    </Label>
                    <PasswordInput id={ 'newPassword' } />

                    {
                              formApi.touched.newPassword && formApi.errors && formApi.errors.newPassword &&
                                <Help isColor={ 'danger' }>{formApi.errors.newPassword}</Help>
                            }
                    <Label>
                      {translate( 'Confirm password' )}
                    </Label>
                    <PasswordInput id={ 'confirmPassword' } />
                    {
                              formApi.touched.confirmPassword && formApi.errors && formApi.errors.confirmPassword &&
                                <Help isColor={ 'danger' }>{formApi.errors.confirmPassword}</Help>
                            }
                    {changePasswordStatus === 'processing' && <Help>{translate( 'Submitting password' )}</Help>}
                    {changePasswordStatus === 'fail' && <Help isColor={ 'danger' }>{translate( 'Old password is not valid' )}</Help>}
                  </Field>
                      }
                footerContent={ [
                  <Button
                    type={ 'submit' }
                    isFullWidth
                    key={ 0 }
                    isColor={ 'success' }
                  >{translate( 'Change Password' )}
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

ChangePasswordModal.propTypes = {
  changePasswordStatus: PropTypes.string,
  onCancel: PropTypes.func,
  onChangePassword: PropTypes.func,
};

ChangePasswordModal.contextTypes = {
  t: PropTypes.func
};

export default ChangePasswordModal;
