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
import Toaster from '../../../components/Toaster/Toaster';

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
  isPasswordModalOpen,
  notAuthStoryId,
  password,
  storyToasterLog,
  storyToasterLogStatus,
  loginStoryLog,
  loginStoryLogStatus,
  actions: {
    enterPassword,
    loginStory,
  },
  // custom functions
  closeAndResetDialog,
  closeLoginDialog,
}, context) => {
  // namespacing the translation keys
  const translate = translateNameSpacer(context.t, 'Features.GlobalUi');
  return (
    <div>
      <LoadingBar style={{backgroundColor: '#3fb0ac', zIndex: 10}} />
      <Toaster status={storyToasterLogStatus} log={storyToasterLog} />
      <Modal
        onRequestClose={closeAndResetDialog}
        contentLabel={translate('edit-story')}
        isOpen={isStoryCandidateModalOpen}>
        <ConfigurationDialog />
      </Modal>
      <Modal
        onRequestClose={closeLoginDialog}
        isOpen={isPasswordModalOpen}
        style={{overlay: {zIndex: 10}}}>
        <LoginDialog
          password={password}
          storyId={notAuthStoryId}
          loginStory={loginStory}
          loginStoryLog={loginStoryLog}
          loginStoryLogStatus={loginStoryLogStatus}
          enterPassword={enterPassword}
          closeLoginDialog={closeLoginDialog} />
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
