/**
 * This module exports a stateless component rendering the layout of the editor feature interface
 * @module fonio/features/Editor
 */
import React, {PropTypes} from 'react';
import Modal from 'react-modal';

import './EditorLayout.scss';

// import QuinoaStoryPlayer from 'quinoa-story-player';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import Footer from '../../../components/Footer/Footer';

import StoriesManagerContainer from '../../StoriesManager/components/StoriesManagerContainer';
import ConfigurationDialog from '../../ConfigurationDialog/components/ConfigurationDialogContainer';
import TakeAwayDialog from '../../TakeAwayDialog/components/TakeAwayDialogContainer';
import AsideViewLayout from './AsideViewLayout';

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
  activeStory,

  // actions
  returnToLanding,
  actions: {
    openTakeAwayModal,
    closeTakeAwayModal,
    setUiMode,
    setLanguage
  },
  openSettings,
  closeAndResetDialog,
}, context) => {

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
  const translate = translateNameSpacer(context.t, 'Features.Editor');
  return (<div id={id} className={className}>
    {activeStoryId ?
      <div className={className}>
        {globalUiMode === 'edition' ?
          <section className="fonio-main-row">
            <AsideViewLayout
              activeStory={activeStory}
              activeStoryId={activeStoryId}
              openSettings={openSettings}
              closeAndResetDialog={closeAndResetDialog}
              returnToLanding={returnToLanding} />
            <div className="fonio-editor-container">
              Hello Fonio
            </div>
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
      contentLabel={translate('edit-story')}
      isOpen={isStoryCandidateModalOpen || isTakeAwayModalOpen}>
      {
        isStoryCandidateModalOpen ?
          <ConfigurationDialog /> :
          <TakeAwayDialog />
      }
    </Modal>
  </div>);
};

EditorLayout.contextTypes = {
  t: PropTypes.func.isRequired
};


export default EditorLayout;
