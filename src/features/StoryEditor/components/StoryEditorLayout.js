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

  activeSectionId,
  // global ui related
  asideUiMode,
  // edited story state
  activeStoryId,
  activeStory,
  editorStates,
  editorFocus,
  assetRequestState,
  // actions
  actions: {
    promptAssetEmbed,
    unpromptAssetEmbed,
    setAsideUiMode,
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

    setAssetRequestContentId,
    startNewResourceConfiguration,
    startExistingResourceConfiguration,
  },
  // custom functions
  openSettings,
  closeAndResetDialog,
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
        closeAndResetDialog={closeAndResetDialog} />
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
          setAssetRequestContentId={setAssetRequestContentId}
          assetRequestPosition={assetRequestState.selection}
          assetRequestContentId={assetRequestState.editorId}

          startNewResourceConfiguration={startNewResourceConfiguration}
          startExistingResourceConfiguration={startExistingResourceConfiguration}

          setEditorFocus={setEditorFocus}
          story={activeStory} />
        :
        <div className="no-sections-selected-container">
          <h1>{translate('no-sections-selected')}</h1>
          <ul>
            {
                activeStory.sectionsOrder.map((thatId, index) => {
                  const setSection = () => setActiveSectionId(thatId);
                  return (
                    <li key={index}>
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


/**
 * Context data used by the component
 */
EditorLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};


export default EditorLayout;
