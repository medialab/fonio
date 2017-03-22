/**
 * This module exports a stateless component rendering the layout of the editor feature interface
 * @module fonio/features/Editor
 */
import React from 'react';
import Modal from 'react-modal';

import './EditorLayout.scss';

// import QuinoaStoryPlayer from 'quinoa-story-player';

import Footer from '../../../components/Footer/Footer';

import StoriesManagerContainer from '../../StoriesManager/components/StoriesManagerContainer';

import ConfigurationDialog from '../../ConfigurationDialog/components/ConfigurationDialogContainer.js';
import TakeAwayDialog from '../../TakeAwayDialog/components/TakeAwayDialogContainer.js';

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
 * @param {function} props.addSlide
 * @param {function} props.duplicateSlide
 * @param {function} props.openSettings
 * @param {function} props.closeAndResetDialog
 * @return {ReactElement} markup
 */
const EditorLayout = ({
  lang,
  // setup related
  id,
  className,

  // global ui related
  isStoryCandidateModalOpen,
  globalUiMode,
  isTakeAwayModalOpen,
  // edited story state
  activeStoryId,
  // activeStory,
  // activeStoryId,

  // actions
  returnToLanding,
  actions: {
    openTakeAwayModal,
    closeTakeAwayModal,
    setUiMode,
    setLanguage
  },
  closeAndResetDialog,
}) => {

  const closeModal = () => {
    if (isStoryCandidateModalOpen) {
      closeAndResetDialog();
    }
    else {
      closeTakeAwayModal();
    }
  };

  const togglePreview = () => {
    if (globalUiMode === 'edition') {
      setUiMode('preview');
    }
   else {
      setUiMode('edition');
    }
  };
  return (<div id={id} className={className}>
    {activeStoryId ?
      <div className={className}>
        {globalUiMode === 'edition' ?
          <section className="fonio-main-row">
            Hello Fonio
          </section>
        :
          <section className="fonio-main-row">
            {/*<QuinoaStoryPlayer
              presentation={activeStory}
              beginAt={activeStory.order.indexOf(activeSlideId)} /> */}
          </section>
        }
        <Footer
          returnToLanding={returnToLanding}
          openTakeAwayModal={openTakeAwayModal}
          togglePreview={togglePreview}
          lang={lang}
          setLanguage={setLanguage}
          uiMode={globalUiMode} />
      </div>
      : <StoriesManagerContainer />}
    <Modal
      onRequestClose={closeModal}
      contentLabel="new presentation"
      isOpen={isStoryCandidateModalOpen || isTakeAwayModalOpen}>
      {
        isStoryCandidateModalOpen ?
          <ConfigurationDialog /> :
          <TakeAwayDialog />
      }
    </Modal>
  </div>);
};

export default EditorLayout;
