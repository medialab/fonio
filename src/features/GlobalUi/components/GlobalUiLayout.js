/* eslint react/jsx-no-bind:0 */

/**
 * This module exports a stateless component rendering the layout of the editor feature interface
 * @module fonio/features/GlobalUi
 */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

import LoadingBar from 'react-redux-loading-bar';

import './GlobalUiLayout.scss';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import ConfigurationDialog from '../../ConfigurationDialog/components/ConfigurationDialogContainer';
import LoginDialog from './LoginDialog';
import ResetPasswordDialog from './ResetPasswordDialog';

import Toaster from '../../../components/Toaster/Toaster';

Modal.setAppElement('#mount');


/**
 * Renders the main layout component of the editor
 * @param {object} props - the props to render
 * @param {string} props.lang - the active language
 * @param {string} props.id
 * @param {string} props.className
 * @param {boolean} props.isStoryCandidateModalOpen
 * @param {boolean} props.isPasswordModalOpen
 * @param {string} props.password
 * @param {string} props.notAuthStoryId
 * @param {boolean} props.isTakeAwayModalOpen
 * @return {ReactElement} markup
 */
const GlobalUiLayout = ({
  // global ui related
  isStoryCandidateModalOpen,
  isLoginModalOpen,
  isResetPasswordModalOpen,
  resetPasswordStoryId,
  notAuthStoryId,
  storyToasterLog,
  storyToasterLogStatus,
  loginStoryLog,
  loginStoryLogStatus,
  resetStoryPasswordLog,
  resetStoryPasswordLogStatus,
  actions: {
    loginStory,
    resetStoryPassword,
    closeResetPasswordModal
  },
  // custom functions
  closeAndResetDialog,
  closeLoginDialog
}, context) => {
  // namespacing the translation keys
  const translate = translateNameSpacer(context.t, 'Features.GlobalUi');
  let toasterMessage = translate('save-story-pending-log');
  switch (storyToasterLog) {
    case 'save-story-fail-log':
      toasterMessage = translate('save-story-fail-log');
      break;
    default:
      break;
  }
  return (
    <div>
      <LoadingBar style={{backgroundColor: '#3fb0ac', zIndex: 10}} />
      {storyToasterLogStatus === 'failure' && <Toaster status={storyToasterLogStatus} log={toasterMessage} />}
      <Modal
        onRequestClose={closeAndResetDialog}
        contentLabel={translate('edit-story')}
        isOpen={isStoryCandidateModalOpen}>
        <ConfigurationDialog />
      </Modal>
      <Modal
        onRequestClose={closeLoginDialog}
        isOpen={isLoginModalOpen}
        style={{overlay: {zIndex: 10}}}>
        <LoginDialog
          storyId={notAuthStoryId}
          loginStory={loginStory}
          loginStoryLog={loginStoryLog}
          loginStoryLogStatus={loginStoryLogStatus}
          closeLoginDialog={closeLoginDialog} />
      </Modal>
      <Modal
        onRequestClose={closeResetPasswordModal}
        isOpen={isResetPasswordModalOpen} >
        <ResetPasswordDialog
          resetPassword={resetStoryPassword}
          storyId={resetPasswordStoryId}
          closeDialog={closeResetPasswordModal}
          log={resetStoryPasswordLog}
          status={resetStoryPasswordLogStatus} />
      </Modal>
    </div>
    );
};


/**
 * Context data used by the component
 */
GlobalUiLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};


export default GlobalUiLayout;
