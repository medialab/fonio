/**
 * This module exports a stateless component rendering the layout of the editor feature interface
 * @module fonio/features/Editor
 */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

// import {
//   // convertToRaw,
//   convertFromRaw,
//   EditorState
// } from 'draft-js';

// import StoryPlayer from 'quinoa-story-player';

import './EditorLayout.scss';

// import QuinoaStoryPlayer from 'quinoa-story-player';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import Footer from '../../../components/Footer/Footer';
import SectionEditor from '../../../components/SectionEditor/SectionEditor';

import StoriesManagerContainer from '../../StoriesManager/components/StoriesManagerContainer';
import ConfigurationDialog from '../../ConfigurationDialog/components/ConfigurationDialogContainer';
import TakeAwayDialog from '../../TakeAwayDialog/components/TakeAwayDialogContainer';
import AsideViewLayout from './AsideViewLayout';

// import DraftEditor from '../../../components/DraftEditor/DraftEditor';

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
  asideUiMode,
  isTakeAwayModalOpen,
  activeSectionId,
  // edited story state
  activeStoryId,
  activeStory,
  editorStates,
  editorFocus,
  assetRequestState,
  assetRequested,

  // actions
  returnToLanding,
  actions: {
    openTakeAwayModal,
    closeTakeAwayModal,
    setUiMode,
    setLanguage,
    // updateStoryContent,
    updateStoryMetadataField,
    promptAssetEmbed,
    unpromptAssetEmbed,
    updateAsset,
    setAsideUiMode,
    // embedAsset,
    updateSection,
    setEditorFocus,
    updateDraftEditorState,
    updateDraftEditorsStates,

    updateContextualizer,
    updateResource,
    deleteContextualization,
    deleteContextualizer,
    setActiveSectionId,
  },
  // custom functions
  openSettings,
  closeAndResetDialog,
  updateStoryContent,
  embedAsset,
  onCreateNewSection,
  summonAsset,
}, context) => {

  // callback for takeaway modal tweaking
  const closeModal = () => {
    if (isStoryCandidateModalOpen) {
      closeAndResetDialog();
    }
    else {
      closeTakeAwayModal();
    }
  };

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
  const translate = translateNameSpacer(context.t, 'Features.Editor');
  const activeSection = activeSectionId && activeStory && activeStory.sections[activeSectionId];
  return (
    <div id={id} className={className}>
      {activeStoryId ?
        <div className={className}>
          {globalUiMode === 'edition' ?
            <section className="fonio-main-row">
              <AsideViewLayout
                activeStory={activeStory}
                activeStoryId={activeStoryId}
                openSettings={openSettings}
                asideUiMode={assetRequestState.assetRequested ? 'resources' : asideUiMode}
                hideNav={assetRequestState.assetRequested === true}
                setAsideUiMode={setAsideUiMode}
                closeAndResetDialog={closeAndResetDialog}
                returnToLanding={returnToLanding} />
              <div className="fonio-editor-container">
                {activeSection ?
                  <SectionEditor
                    activeSection={activeSection}
                    sectionId={activeSection.id}
                    activeStoryId={activeStoryId}
                    updateSection={updateSection}
                    editorStates={editorStates}
                    updateDraftEditorState={updateDraftEditorState}
                    updateDraftEditorsStates={updateDraftEditorsStates}
                    editorFocus={editorFocus}

                    summonAsset={summonAsset}
                    updateContextualizer={updateContextualizer}
                    updateResource={updateResource}
                    deleteContextualization={deleteContextualization}
                    deleteContextualizer={deleteContextualizer}

                    requestAsset={promptAssetEmbed}
                    cancelAssetRequest={unpromptAssetEmbed}
                    assetRequestState={assetRequestState}
                    assetRequestPosition={assetRequestState.selection}

                    setEditorFocus={setEditorFocus}
                    story={activeStory} />
                :
                  <div>
                    <p>{translate('no-sections-selected')}</p>
                    <ul>
                      {
                        activeStory.sectionsOrder.map(thatId => {
                          const setSection = () => setActiveSectionId(thatId);
                          return (
                            <li key={id}>
                              <button onClick={setSection}>
                                {activeStory.sections[id] && activeStory.sections[id].metadata.title || translate('untitled-section')}
                              </button>
                            </li>
                        );
})
                      }
                    </ul>
                    <div>
                      <button onClick={onCreateNewSection}>
                        {translate('create-new-section')}
                      </button>
                    </div>
                  </div>
              }
              </div>
            </section>
        :
            <span>Todo new story player</span>
          // <section className="fonio-main-row">
          //   <StoryPlayer
          //     story={{
          //       ...activeStory,
          //       content: activeStory.content
          //     }} />
          // </section>
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
