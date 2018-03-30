import React from 'react';
import PropTypes from 'prop-types';
import {Form, Text} from 'react-form';

import Toaster from '../../../components/Toaster/Toaster';

import {translateNameSpacer} from '../../../helpers/translateUtils';

/**
 * Renders the StoryCard component as a pure function
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
const ResetPasswordDialog = ({
  status,
  storyId,
  closeDialog,
  resetPassword
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.GlobalUi');
  let toasterMessage;
  switch (status) {
    case 'processing':
      toasterMessage = translate('reset-password-pending-log');
      break;
    case 'success':
      toasterMessage = translate('reset-password-success-log');
      break;
    case 'failure':
      toasterMessage = translate('reset-password-fail-log');
      break;
    default:
      break;
  }
  const resetPasswordSubmit = values => {
    resetPassword(storyId, values.oldPassword, values.newPassword);
  };
  const errorValidator = (values) => {
    return {
      oldPassword: !values.oldPassword ? translate('old-password-is-required') : null,
      newPassword: !values.newPassword || values.newPassword.length < 6 ? translate('password-should-be-at-least-6-characters') : null,
      confirmPassword: values.newPassword !== values.confirmPassword ? translate('password-does-not-match') : null
    };
  };

  return (
    <div className="fonio-ResetPasswordDialog">
      <h1 className="modal-header">
        <span className="modal-header-title">{translate('change-password')}</span>
        <button className="close-btn" onClick={closeDialog}>
          <img src={require('../../../sharedAssets/cancel-white.svg')} />
        </button>
      </h1>
      <Form onSubmit={resetPasswordSubmit} validateError={errorValidator}>
        {formApi => (
          <form onSubmit={formApi.submitForm} id="reset-form" className="fonio-form">
            <div className="modal-content">
              <div className="modal-row">
                <div className="input-group">
                  <label htmlFor="oldPassword" className="label">{translate('admin-or-old-password')}</label>
                  <Text field="oldPassword" id="oldPassword" type="password" />
                </div>
                {
                  formApi.touched.oldPassword && <Toaster status={formApi.errors.oldPassword ? 'failure' : undefined} log={formApi.errors.oldPassword} />
                }
                <div className="input-group">
                  <label htmlFor="newPassword" className="label">{translate('new-password')}</label>
                  <Text field="newPassword" id="newPassword" type="password" />
                </div>
                {
                  formApi.touched.newPassword && <Toaster status={formApi.errors.newPassword ? 'failure' : undefined} log={formApi.errors.newPassword} />
                }
                <div className="input-group">
                  <label htmlFor="confirmPassword" className="label">{translate('confirm-password')}</label>
                  <Text field="confirmPassword" id="confirmPassword" type="password" />
                </div>
                {
                  formApi.touched.confirmPassword && <Toaster status={formApi.errors.confirmPassword ? 'failure' : undefined} log={formApi.errors.confirmPassword} />
                }
              </div>
              {toasterMessage &&
                <div className="modal-row no-bg">
                  <Toaster status={status} log={toasterMessage} />
                </div>
              }
            </div>
            <div className="modal-footer override-modal-footer">
              <button className="valid-btn" type="submit">
                {translate('submit-new-password')}
              </button>
            </div>
          </form>
        )}
      </Form>
    </div>
  );
};

ResetPasswordDialog.contextTypes = {
  t: PropTypes.func.isRequired
};

export default ResetPasswordDialog;
