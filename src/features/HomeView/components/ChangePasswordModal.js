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
    <Form onSubmit={onSumitForm} validateError={errorValidator}>
      {
        formApi => (
          <form onSubmit={formApi.submitForm} id="login-form" className="fonio-form">
            <ModalCard
              isActive
              headerContent={translate('Delete a story')}
              mainContent={
                <Field>
                  <Label>
                    {translate('Enter your password')}
                    <HelpPin place="right">
                      {translate('Explanation about the password')}
                    </HelpPin>
                  </Label>
                  <Control hasIcons>
                    <Text field="oldPassword" id="oldPassword" type="password" />
                    <Icon isSize="small" isAlign="left">
                      <span className="fa fa-lock" aria-hidden="true" />
                    </Icon>
                    <Icon isSize="small" isAlign="right">
                      <span className="fa fa-exclamation" aria-hidden="true" />
                    </Icon>
                  </Control>
                  <Control hasIcons>
                    <Text field="newPassword" id="newPassword" type="password" />
                    <Icon isSize="small" isAlign="left">
                      <span className="fa fa-lock" aria-hidden="true" />
                    </Icon>
                    <Icon isSize="small" isAlign="right">
                      <span className="fa fa-exclamation" aria-hidden="true" />
                    </Icon>
                  </Control>
                  <Control hasIcons>
                    <Text field="confirmPassword" id="confirmPassword" type="password" />
                    <Icon isSize="small" isAlign="left">
                      <span className="fa fa-lock" aria-hidden="true" />
                    </Icon>
                    <Icon isSize="small" isAlign="right">
                      <span className="fa fa-exclamation" aria-hidden="true" />
                    </Icon>
                  </Control>
                  {/*loginStatus === 'processing' && <Help>{translate('Submitting password')}</Help>*/}
                  {/*loginStatus === 'fail' && <Help isColor="danger">{translate('Password is not valid')}</Help>*/}
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
  onChangePassword: PropTypes.func,
  onCancel: PropTypes.func,
};

ChangePasswordModal.contextTypes = {
  t: PropTypes.func
};

export default ChangePasswordModal;
