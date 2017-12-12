import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import {Redirect} from 'react-router-dom';

import './PasswordModal.scss';
import Toaster from '../Toaster/Toaster';

import {translateNameSpacer} from '../../helpers/translateUtils';

/**
 * Renders the StoryCard component as a pure function
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
const PasswordModal = ({
  history,
  location,
  password,
  loginStoryLog,
  loginStoryLogStatus,
  enterPassword,
  loginStory,
}, context) => {

  const translate = translateNameSpacer(context.t, 'Components.AssetPreview');

  const onPasswordChange = (e) => enterPassword(e.target.value);
  const loginToStory = () => {
    const story = {
      id: location.state.storyId,
      password
    };
    loginStory(story);
  };

  const goBack = (e) => {
    e.stopPropagation();
    history.goBack();
  };

  if (loginStoryLogStatus === 'success') {
    return (
      <Redirect to={location.state.to} />
    );
  }
  return (
    <Modal
      isOpen={true}
      onRequestClose={goBack}>
      <h1 className="modal-header">
        Enter your password
      </h1>
      <div className="modal-content">
        <div className="modal-row">
          <div className="input-group">
            <input
              onChange={onPasswordChange}
              type="password"
              name="password"
              placeholder="password"
              value={password || ''} />
          </div>
        </div>
        <div className="modal-row">
          <Toaster status={loginStoryLogStatus} log={loginStoryLog} />
        </div>
        <div className="modal-footer override-modal-footer">
          <button className="valid-btn" onClick={loginToStory}>
            login
          </button>
          <button onClick={goBack}
            className="cancel-btn">
            cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

PasswordModal.contextTypes = {
  t: PropTypes.func.isRequired
};

export default PasswordModal;
