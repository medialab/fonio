/**
 * This module exports a stateless component rendering the layout of the editor feature interface
 * @module fonio/features/Editor
 */
import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import './StoryEditorLayout.scss';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import SectionEditor from '../../../components/SectionEditor/SectionEditor';

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

    createContextualization,
    createContextualizer,
    createResource,

    updateDraftEditorState,
    updateDraftEditorsStates,

    updateContextualizer,
    updateResource,
    deleteContextualization,
    deleteContextualizer,
    setActiveSectionId,

    startExistingResourceConfiguration,
  },
  // custom functions
  openSettings,
  closeAndResetDialog,
  updateStoryContent,
  embedAsset,
  onCreateNewSection,
  summonAsset,
}, context) => {

  // namespacing the translation keys
  const translate = translateNameSpacer(context.t, 'Features.Editor');
  const activeSection = activeSectionId && activeStory && activeStory.sections[activeSectionId];
  return (
    <div className="fonio-StoryEditorLayout">
      <Helmet>
        <title>Fonio - {(activeStory && activeStory.metadata.title) || translate('untitled-story')}</title>
      </Helmet>
      <AsideViewLayout
        activeStory={activeStory}
        activeStoryId={activeStoryId}
        openSettings={openSettings}
        asideUiMode={assetRequestState.assetRequested ? 'resources' : asideUiMode}
        hideNav={assetRequestState.assetRequested === true}
        setAsideUiMode={setAsideUiMode}
        closeAndResetDialog={closeAndResetDialog}
        returnToLanding={returnToLanding} />
      {activeSection ?
        <SectionEditor
          activeSection={activeSection}
          sectionId={activeSection.id}
          activeStory={activeStory}
          activeStoryId={activeStoryId}
          updateSection={updateSection}
          editorStates={editorStates}
          updateDraftEditorState={updateDraftEditorState}
          updateDraftEditorsStates={updateDraftEditorsStates}
          editorFocus={editorFocus}

          summonAsset={summonAsset}

          createContextualization={createContextualization}
          createContextualizer={createContextualizer}
          createResource={createResource}

          updateContextualizer={updateContextualizer}
          updateResource={updateResource}
          deleteContextualization={deleteContextualization}
          deleteContextualizer={deleteContextualizer}

          requestAsset={promptAssetEmbed}
          cancelAssetRequest={unpromptAssetEmbed}
          assetRequestState={assetRequestState}
          assetRequestPosition={assetRequestState.selection}

          startExistingResourceConfiguration={startExistingResourceConfiguration}

          setEditorFocus={setEditorFocus}
          story={activeStory} />
        :
        <div className="no-sections-selected-container">
          <h1>{translate('no-sections-selected')}</h1>
          <ul>
            {
                activeStory.sectionsOrder.map(thatId => {
                  const setSection = () => setActiveSectionId(thatId);
                  return (
                    <li key={id}>
                      <button onClick={setSection}>
                        {activeStory.sections[thatId] && activeStory.sections[thatId].metadata.title || translate('untitled-section')}
                      </button>
                    </li>
                  );
                })
              }
          </ul>
          <div className="create-new-section-container">
            <button onClick={onCreateNewSection}>
              {translate('create-new-section')}
            </button>
          </div>
        </div>
      }
    </div>
  );
};

EditorLayout.contextTypes = {
  t: PropTypes.func.isRequired
};


export default EditorLayout;
