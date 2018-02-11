import React from 'react';
import PropTypes from 'prop-types';

import Toaster from '../../../components/Toaster/Toaster';

// import {translateNameSpacer} from '../../helpers/translateUtils';

/**
 * Renders the StoryCard component as a pure function
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
const LoginDialog = ({
  storyId,
  password,
  enterPassword,
  loginStory,
  loginStoryLog,
  loginStoryLogStatus,
  closeLoginDialog
},
// context
) => {

  const onPasswordChange = (e) => enterPassword(e.target.value);
  const onLoginStory = () => loginStory(storyId, password);

  return (
    <div className="fonio-LoginDialog">
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
          <button className="valid-btn" onClick={onLoginStory}>
            login
          </button>
          <button
            onClick={closeLoginDialog}
            className="cancel-btn">
            cancel
          </button>
        </div>
      </div>
    </div>
  );
};

LoginDialog.contextTypes = {
  t: PropTypes.func.isRequired
};

export default LoginDialog;
