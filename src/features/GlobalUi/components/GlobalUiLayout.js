/**
 * This module exports a stateless component rendering the layout of the editor feature interface
 * @module fonio/features/GlobalUi
 */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import {
  BrowserRouter as Router,
  Route, Switch, Redirect
} from 'react-router-dom';

import './GlobalUiLayout.scss';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import Footer from '../../../components/Footer/Footer';
import StoryEditorContainer from '../../StoryEditor/components/StoryEditorContainer';
import StorySettingsManagerContainer from '../../StorySettingsManager/components/StorySettingsManagerContainer';
import StoryPlayer from 'quinoa-story-player';
import PasswordModal from '../../../components/PasswordModal/PasswordModal';

import StoriesManagerContainer from '../../StoriesManager/components/StoriesManagerContainer';
import ConfigurationDialog from '../../ConfigurationDialog/components/ConfigurationDialogContainer';
import TakeAwayDialog from '../../TakeAwayDialog/components/TakeAwayDialogContainer';


/**
 * Renders the main layout component of the editor
 * @param {object} props - the props to render
 * @param {string} props.lang - the active language
 * @param {string} props.id
 * @param {string} props.className
 * @param {boolean} props.isStoryCandidateModalOpen
 * @param {string} props.globalUiMode
 * @param {boolean} props.isTakeAwayModalOpen
 * @param {string} props.slideSettingsPannelState
 * @param {object} props.activeViews - object containing the views being displayed in the editor
 * @param {string} props.activeSlideId
 * @param {object} props.editedColor
 * @param {string} props.activeStoryId
 * @param {object} props.activeStory
 * @param {function} props.onProjectImport
 * @param {function} props.returnToLanding
 * @param {object} props.actions - actions passed by redux logic
 * @param {function} props.openSettings
 * @param {function} props.closeAndResetDialog
 * @return {ReactElement} markup
 */
const GlobalUiLayout = ({
  lang,
  // setup related
  id,
  className,

  // global ui related
  isStoryCandidateModalOpen,
  globalUiMode,
  isTakeAwayModalOpen,
  isPasswordModalOpen,
  hideCancelSettingButton,
  // stories related
  allStories,
  // storiesUi related
  password,
  loginStoryLog,
  loginStoryLogStatus,

  // actions,
  actions: {
    openTakeAwayModal,
    closeTakeAwayModal,
    setUiMode,
    setLanguage,

    startStoryCandidateConfiguration,
    loginStory,
    enterPassword,
  },
  // custom functions
  closeAndResetDialog,
}, context) => {

  /**
   * Callbacks
   */

  // callback for preview mode tweaking
  const togglePreview = () => {
    if (globalUiMode === 'edition') {
      setUiMode('preview');
    }
   else {
      setUiMode('edition');
    }
  };

  // namespacing the translation keys
  const translate = translateNameSpacer(context.t, 'Features.GlobalUi');
  return (
    <Router>
      <div id={id} className={'fonio-GlobalUiLayout ' + className}>
        <Modal
          onRequestClose={hideCancelSettingButton ? null : closeAndResetDialog}
          contentLabel={translate('edit-story')}
          isOpen={isStoryCandidateModalOpen}>
          <ConfigurationDialog />
        </Modal>
        <Switch>
          <Route exact path="/" component={StoriesManagerContainer} />
          <Route
            path="/:id/:mode"
            render={({match}) => (
            allStories[match.params.id] ? (
              <div className="story-editor-container">
                <section className="fonio-main-row">
                  {match.params.mode === 'read' ? (
                    <StoryPlayer story={allStories[match.params.id]} />
                  ) : (globalUiMode === 'edition' ?
                    <StoryEditorContainer
                      activeStoryId={match.params.id}
                      activeStory={allStories[match.params.id]} />
                   :
                    <StorySettingsManagerContainer
                      activeStoryId={match.params.id}
                      activeStory={allStories[match.params.id]} />
                  )}
                </section>
                <Footer
                  openTakeAwayModal={openTakeAwayModal}
                  togglePreview={togglePreview}
                  lang={lang}
                  setLanguage={setLanguage}
                  uiMode={globalUiMode}
                  activeStory={allStories[match.params.id]}
                  startStoryCandidateConfiguration={startStoryCandidateConfiguration}
                  mode={match.params.mode} />
                <Modal
                  onRequestClose={closeTakeAwayModal}
                  contentLabel={translate('edit-story')}
                  isOpen={isTakeAwayModalOpen}>
                  <TakeAwayDialog activeStory={allStories[match.params.id]} />
                </Modal>
              </div>
            ) : (
              <Redirect to="/" />
            )
          )} />
        </Switch>
        <Route path="/login" render={(props) => (
          <PasswordModal
            {...props}
            password={password}
            loginStory={loginStory}
            enterPassword={enterPassword}
            loginStoryLogStatus={loginStoryLogStatus}
            loginStoryLog={loginStoryLog} />
          )} />
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
