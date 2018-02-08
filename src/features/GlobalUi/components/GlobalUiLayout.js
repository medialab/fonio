/* eslint react/jsx-no-bind:0 */

/**
 * This module exports a stateless component rendering the layout of the editor feature interface
 * @module fonio/features/GlobalUi
 */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
} from 'react-router-dom';
import LoadingBar from 'react-redux-loading-bar';

import './GlobalUiLayout.scss';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import StoriesManagerContainer from '../../StoriesManager/components/StoriesManagerContainer';
import StoryViewContainer from '../../StoryView/components/StoryViewContainer';
import ConfigurationDialog from '../../ConfigurationDialog/components/ConfigurationDialogContainer';
import PasswordModal from '../../../components/PasswordModal/PasswordModal';

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
  // setup related
  id,
  className,
  // global ui related
  isStoryCandidateModalOpen,
  isPasswordModalOpen,
  notAuthStoryId,
  password,
  actions: {
    enterPassword,
    loginStory,
    closePasswordModal,
  },
  // custom functions
  closeAndResetDialog,
}, context) => {
  // namespacing the translation keys
  const translate = translateNameSpacer(context.t, 'Features.GlobalUi');
  return (
    <Router>
      <div id={id} className={'fonio-GlobalUiLayout ' + className}>
        <LoadingBar style={{backgroundColor: '#3fb0ac', zIndex: 10}} />
        <Modal
          onRequestClose={closeAndResetDialog}
          contentLabel={translate('edit-story')}
          isOpen={isStoryCandidateModalOpen}>
          <ConfigurationDialog />
        </Modal>
        <PasswordModal
          isPasswordModalOpen={isPasswordModalOpen}
          closePasswordModal={closePasswordModal}
          password={password}
          storyId={notAuthStoryId}
          loginStory={loginStory}
          enterPassword={enterPassword} />
        <Switch>
          <Route exact path="/" component={StoriesManagerContainer} />
          <Route path="/story/:id/:mode?" render={(props) => (<StoryViewContainer {...props} />)} />
          <Route render={(props) => (
            // TODO: loading/error page
            <h2>
              No match for {props.location.pathname}, go back to <Link to="/">Home page</Link>
            </h2>
          )} />
        </Switch>
      </div>
    </Router>
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
