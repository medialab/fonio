import React from 'react';
import PropTypes from 'prop-types';
import {Form, Text} from 'react-form';

import Toaster from '../../../components/Toaster/Toaster';

import {translateNameSpacer} from '../../../helpers/translateUtils';
import './LoginDialog.scss';
/**
 * Renders the StoryCard component as a pure function
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
const LoginDialog = ({
  storyId,
  loginStory,
  loginStoryLogStatus,
  closeLoginDialog,
  linkToRead
}, context) => {
  const translate = translateNameSpacer(context.t, 'Features.GlobalUi');
  let toasterMessage;
  switch (loginStoryLogStatus) {
    case 'processing':
      toasterMessage = translate('login-story-pending-log');
      break;
    case 'success':
      toasterMessage = translate('login-story-success-log');
      break;
    case 'failure':
      toasterMessage = translate('login-story-fail-log');
      break;
    default:
      break;
  }
  const loginSubmit = values => {
    loginStory(storyId, values.password);
  };
  const onLinkToRead = () => {
    linkToRead(storyId);
  };
  return (
    <div className="fonio-LoginDialog">
      <h1 className="modal-header">
        {translate('login')}
      </h1>
      <Form onSubmit={loginSubmit}>
        {formApi => (
          <form onSubmit={formApi.submitForm} id="login-form" className="fonio-form">
            <div className="modal-content">
              <div className="modal-row">
                <div className="input-group">
                  <label htmlFor="password" className="label">{translate('enter-your-password')}</label>
                  <Text field="password" id="password" type="password" />
                </div>
              </div>
              <div className="modal-row">
                <Toaster status={loginStoryLogStatus} log={toasterMessage} />
              </div>
              <div className="modal-row link-to-read">
                <button
                  onClick={onLinkToRead}
                  className="link-btn">
                  {translate('read-the-story')}
                </button>
              </div>
            </div>
            <div className="modal-footer override-modal-footer">
              <button className="valid-btn" type="submit">
                {translate('login')}
              </button>
              <button
                onClick={closeLoginDialog}
                className="cancel-btn">
                {translate('cancel')}
              </button>
            </div>
          </form>
        )}
      </Form>
    </div>
  );
};

LoginDialog.contextTypes = {
  t: PropTypes.func.isRequired
};

export default LoginDialog;
