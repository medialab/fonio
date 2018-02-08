/* eslint no-nested-ternary:0 */

/**
 * This module exports a stateless component rendering the layout of the story view interface
 * @module fonio/features/StoryPage
 */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import {Link} from 'react-router-dom';

import Footer from '../../../components/Footer/Footer';
import StoryPlayer from 'quinoa-story-player';

import TakeAwayDialog from '../../TakeAwayDialog/components/TakeAwayDialogContainer';
import StoryEditorContainer from '../../StoryEditor/components/StoryEditorContainer';
import StorySettingsManagerContainer from '../../StorySettingsManager/components/StorySettingsManagerContainer';

const StoryViewLayout = ({
  match,
  history,
  globalUiMode,
  activeStory,
  lang,
  isTakeAwayModalOpen,
  actions: {
    setLanguage,
    saveStory,
    setUiMode,
    startStoryCandidateConfiguration,
    openTakeAwayModal,
    closeTakeAwayModal
  }
}) => {
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
  const onClickMetadata = () => {
    startStoryCandidateConfiguration(activeStory);
  };
  const handleSaveStory = () => {
    const token = localStorage.getItem(activeStory.id);
    saveStory(activeStory, token);
  };

  return (
    activeStory ?
      <div className="story-editor-container">
        <section className="fonio-main-row">
          {match.params.mode ?
            (globalUiMode === 'edition' ?
              <StoryEditorContainer /> :
              <StorySettingsManagerContainer />
            )
            : (<StoryPlayer story={activeStory} />)}
        </section>
        <Footer
          openTakeAwayModal={openTakeAwayModal}
          togglePreview={togglePreview}
          lang={lang}
          setLanguage={setLanguage}
          uiMode={globalUiMode}
          onClickMetadata={onClickMetadata}
          onClickSave={handleSaveStory}
          mode={match.params.mode} />
        <Modal
          onRequestClose={closeTakeAwayModal}
          isOpen={isTakeAwayModalOpen}>
          <TakeAwayDialog history={history} />
        </Modal>
      </div> :
      // TODO: loading/error page
      <h2>
        story not found , go back to <Link to="/">Home page</Link>
      </h2>
  );
};

/**
 * Context data used by the component
 */
StoryViewLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

export default StoryViewLayout;
