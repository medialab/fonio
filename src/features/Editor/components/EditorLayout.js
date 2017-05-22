/**
 * This module exports a stateless component rendering the layout of the editor feature interface
 * @module fonio/features/Editor
 */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

import {
  // convertToRaw,
  convertFromRaw,
  EditorState
} from 'draft-js';

import StoryPlayer from 'quinoa-story-player';

import './EditorLayout.scss';

// import QuinoaStoryPlayer from 'quinoa-story-player';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import Footer from '../../../components/Footer/Footer';

import StoriesManagerContainer from '../../StoriesManager/components/StoriesManagerContainer';
import ConfigurationDialog from '../../ConfigurationDialog/components/ConfigurationDialogContainer';
import TakeAwayDialog from '../../TakeAwayDialog/components/TakeAwayDialogContainer';
import AsideViewLayout from './AsideViewLayout';

import DraftEditor from '../../../components/DraftEditor/DraftEditor';

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
  editorStates,

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
    updateAsset,
    // embedAsset
  },
  openSettings,
  closeAndResetDialog,
  updateStoryContent,
  embedAsset
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
  const onStoryUpdate = (content) => {
    updateStoryContent(activeStory.id, content);
  };
  const onTitleChange = (e) => updateStoryMetadataField(activeStory.id, 'title', e.target.value);
  let editorState;
  if (editorStates[activeStoryId]) {
    editorState = editorStates[activeStoryId];
  }
 else if (activeStory && activeStory.content) {
    editorState = EditorState.createWithContent(convertFromRaw(activeStory.content));
  }
 else {
    EditorState.createEmpty();
  }
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
              <h1 className="editable-title">
                <input
                  type="text"
                  value={activeStory.metadata.title || ''}
                  onChange={onTitleChange}
                  placeholder={translate('story-title')} />
              </h1>

              {EditorState && <DraftEditor
                update={onStoryUpdate}
                content={editorState}
                assets={activeStory.assets}
                onAssetPrompted={promptAssetEmbed}
                storyId={activeStoryId}
                updateAsset={updateAsset}
                embedAsset={embedAsset}
                translate={translate} />}
            </div>
          </section>
        :
          <section className="fonio-main-row">
            <StoryPlayer
              story={{
                ...activeStory,
                content: activeStory.content // convertToRaw(activeStory.content.getCurrentContent())
              }} />
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
