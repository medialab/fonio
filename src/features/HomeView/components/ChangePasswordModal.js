import React from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import {
  Button,
  ModalCard,
  Field,
  Label,
  HelpPin,
  Control,
  Icon,
  Help
} from 'quinoa-design-library/components/';

import {Form, Text} from 'react-form';

const ChangePasswordModal = ({
  changePasswordStatus,
  onChangePassword,
  onCancel
}, {
  t
}) => {
  const translate = translateNameSpacer(t, 'Components.ChangePasswordModal');

  const errorValidator = (values) => {
    return {
      oldPassword: !values.oldPassword ? translate('Old password is required') : null,
      newPassword: !values.newPassword || values.newPassword.length < 6 ? translate('Password should be at least 6 characters') : null,
      confirmPassword: values.newPassword !== values.confirmPassword ? translate('password does not match') : null
    };
  };
  const onSumitForm = values => {
    onChangePassword(values.oldPassword, values.newPassword);
  };

  return (
    <Form onSubmit={onSumitForm} validate={errorValidator}>
      {
        formApi => (
          <form onSubmit={formApi.submitForm} id="login-form" className="fonio-form">
            <ModalCard
              isActive
              headerContent={translate('Change password')}
              onClose={onCancel}
              mainContent={
                <Field>
                  <Label>
                    {translate('Old password')}
                    <HelpPin place="right">
                      {translate('Explanation about the password')}
                    </HelpPin>
                  </Label>
                  <Control hasIcons>
                    <Text className="input" field="oldPassword" id="oldPassword" type="password" />
                    <Icon isSize="small" isAlign="left">
                      <span className="fa fa-lock" aria-hidden="true" />
                    </Icon>
                    <Icon isSize="small" isAlign="right">
                      <span className="fa fa-exclamation" aria-hidden="true" />
                    </Icon>
                  </Control>
                  {
                    formApi.touched.oldPassword && formApi.errors && formApi.errors.oldPassword &&
                      <Help isColor="danger">{formApi.errors.oldPassword}</Help>
                  }
                  <Label>
                    {translate('New password')}
                  </Label>
                  <Control hasIcons>
                    <Text className="input" field="newPassword" id="newPassword" type="password" />
                    <Icon isSize="small" isAlign="left">
                      <span className="fa fa-lock" aria-hidden="true" />
                    </Icon>
                    <Icon isSize="small" isAlign="right">
                      <span className="fa fa-exclamation" aria-hidden="true" />
                    </Icon>
                  </Control>
                  {
                    formApi.touched.newPassword && formApi.errors && formApi.errors.newPassword &&
                      <Help isColor="danger">{formApi.errors.newPassword}</Help>
                  }
                  <Label>
                    {translate('Confirm password')}
                  </Label>
                  <Control hasIcons>
                    <Text className="input" field="confirmPassword" id="confirmPassword" type="password" />
                    <Icon isSize="small" isAlign="left">
                      <span className="fa fa-lock" aria-hidden="true" />
                    </Icon>
                    <Icon isSize="small" isAlign="right">
                      <span className="fa fa-exclamation" aria-hidden="true" />
                    </Icon>
                  </Control>
                  {
                    formApi.touched.confirmPassword && formApi.errors && formApi.errors.confirmPassword &&
                      <Help isColor="danger">{formApi.errors.confirmPassword}</Help>
                  }
                  {changePasswordStatus === 'processing' && <Help>{translate('Submitting password')}</Help>}
                  {changePasswordStatus === 'fail' && <Help isColor="danger">{translate('Old password is not valid')}</Help>}
                </Field>
            }
              footerContent={[
                <Button
                  type="submit" isFullWidth key={0}
                  isColor="success">{translate('Change Password')}</Button>,
                <Button isFullWidth key={2} onClick={onCancel} >
                  {translate('Cancel')}
                </Button>
            ]} />
          </form>
        )
      }
    </Form>
  );
};

ChangePasswordModal.propTypes = {
  changePasswordStatus: PropTypes.string,
  onChangePassword: PropTypes.func,
  onCancel: PropTypes.func,
};

ChangePasswordModal.contextTypes = {
  t: PropTypes.func
};

export default ChangePasswordModal;
