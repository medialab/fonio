/**
 * This module provides the layout for the main column of the editor
 * @module fonio/features/SectionView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Column,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
import SectionEditor from '../../../components/SectionEditor';
import { createBibData } from '../../../helpers/resourcesUtils';
import SectionHeader from './SectionHeader';

import MainSectionAside from './MainSectionAside';

const MainSectionColumn = ( {
  userLockedResourceId,
  mainColumnMode,
  newResourceMode,
  defaultSectionMetadata,

  uploadStatus,

  story,
  section,
  userId,

  editorStates,
  editorFocus,
  assetRequestState,
  draggedResourceId,
  previousEditorFocus,

  newResourceType,
  storyIsSaved,

  updateSection,

  setMainColumnMode,
  setShortcutsHelpVisible,
  onNewSectionSubmit,

  promptAssetEmbed,
  unpromptAssetEmbed,
  setEditorFocus,

  createContextualization,
  createContextualizer,
  createResource,
  uploadResource,

  setEditorPastingStatus,
  editorPastingStatus,

  leaveBlock,

  updateDraftEditorState,
  updateDraftEditorsStates,
  setNewResourceMode,

  updateContextualizer,
  updateResource,
  deleteContextualization,
  deleteContextualizer,
  deleteContextualizationFromId,

  setUploadStatus,

  setEditorBlocked,
  setStoryIsSaved,
  setErrorMessage,
  setAssetRequestContentId,
  handleStartNewResourceConfiguration,
  handleStartExistingResourceConfiguration,

  submitMultiResources,

  onOpenSectionSettings,

  summonAsset,

  selectedContextualizationId,
  setSelectedContextualizationId,
}, {
  t
} ) => {

  /**
   * Variables definition
   */
   const {
    resources,
  } = story;

  /**
   * Computed variables
   */
   const editorWidth = {
    mobile: mainColumnMode === 'edition' && !userLockedResourceId ? 10 : 12,
    tablet: mainColumnMode === 'edition' && !userLockedResourceId ? 10 : 12,
    widescreen: mainColumnMode === 'edition' && !userLockedResourceId ? 8 : 12
  };
  const editorX = {
    mobile: mainColumnMode === 'edition' && !userLockedResourceId ? 1 : 0,
    tablet: mainColumnMode === 'edition' && !userLockedResourceId ? 1 : 0,
    widescreen: mainColumnMode === 'edition' && !userLockedResourceId ? 2 : 0
  };

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.SectionView' );
  const guessTitle = ( title = '' ) => {
    const endNumberRegexp = /([0-9]+)$/;
    const numberMatch = title.match( endNumberRegexp );
    if ( numberMatch ) {
      const number = +numberMatch[1];
      if ( !isNaN( number ) ) {
        const newNumber = number + 1;
        const newTitle = title.replace( endNumberRegexp, `${newNumber }` );
        return newTitle;
      }
    }
    return '';
  };

  /**
   * Callbacks handlers
   */
  const handleUpdateSection = ( newSection, callback ) => {
    updateSection( newSection, callback );
  };
  const handleUpdateMetadata = ( metadata ) => {
    handleUpdateSection( {
      ...section,
      metadata: {
        ...section.metadata,
        ...metadata
      }
    } );
    setMainColumnMode( 'edition' );
  };
  const handleTitleBlur = ( title ) => {
    if ( title.length ) {
      const newSection = {
        ...section,
        metadata: {
          ...section.metadata,
          title
        }
      };
      handleUpdateSection( newSection );
    }
  };
  const handleTitleFocus = () => {
    setEditorFocus( undefined );
  };
  const handleEditMetadataClick = () => {
    if ( mainColumnMode !== 'editmetadata' ) {
      onOpenSectionSettings( section.id );
    }
    else {
      setMainColumnMode( 'edition' );
    }
  };
  const handleOpenShortcutsHelp = () => setShortcutsHelpVisible( true );

  return (
    <Column
      isSize={ 'fullwidth' }
      isWrapper
    >
      <StretchedLayoutContainer
        isFluid
        isAbsolute
        isDirection={ 'horizontal' }
      >
        <StretchedLayoutItem isFlex={ mainColumnMode === 'edition' && !userLockedResourceId ? 0 : 6 }>
          <MainSectionAside
            {
              ...{
                userLockedResourceId,
                uploadResource,
                createBibData,
                story,
                userId,
                uploadStatus,
                createResource,
                updateResource,
                setUploadStatus,
                leaveBlock,
                resources,
                setMainColumnMode,
                mainColumnMode,
                setNewResourceMode,
                newResourceMode,
                defaultSectionMetadata,
                onNewSectionSubmit,
                handleUpdateMetadata,
                section,
                newResourceType,
                guessTitle,
                submitMultiResources,
              }
            }
          />
        </StretchedLayoutItem>
        <StretchedLayoutItem isFlex={ mainColumnMode === 'edition' && !userLockedResourceId ? 12 : 6 }>
          <Column
            isWrapper
            isSize={ 12 }
            isOffset={ 0 }
          >
            <StretchedLayoutContainer
              isAbsolute
              isDirection={ 'vertical' }
            >
              <StretchedLayoutItem>
                <Column
                  isSize={ editorWidth }
                  isOffset={ editorX }
                  style={ { paddingBottom: 0 } }
                  isWrapper
                >
                  {/* editor header*/}
                  <StretchedLayoutContainer
                    style={ { overflow: 'visible' } }
                    isFluid
                    isDirection={ 'horizontal' }
                  >
                    <StretchedLayoutItem
                      style={ { overflow: 'visible' } }
                      isFlex={ 1 }
                    >
                      <SectionHeader
                        title={ section.metadata.title }
                        onEdit={ handleEditMetadataClick }
                        onBlur={ handleTitleBlur }
                        onFocus={ handleTitleFocus }
                        placeHolder={ translate( 'Section title' ) }

                        isDisabled={ userLockedResourceId || ( mainColumnMode !== 'edition' && mainColumnMode !== 'editmetadata' ) }
                        isColor={ mainColumnMode === 'editmetadata' ? 'primary' : '' }
                        editTip={ translate( 'Edit section metadata' ) }
                        inputTip={ translate( 'Section title' ) }
                      />
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Column>
              </StretchedLayoutItem>
              {/*editor*/}
              <StretchedLayoutItem isFlex={ 1 }>
                <Column isWrapper>
                  <SectionEditor
                    {
                      ...{
                        assetRequestState,
                        createContextualization,
                        createContextualizer,
                        createResource,
                        deleteContextualization,
                        deleteContextualizationFromId,
                        deleteContextualizer,
                        draggedResourceId,
                        editorFocus,
                        editorPastingStatus,
                        editorStates,
                        editorWidth,
                        previousEditorFocus,
                        selectedContextualizationId,
                        setAssetRequestContentId,
                        setEditorBlocked,
                        setEditorFocus,
                        setEditorPastingStatus,
                        setErrorMessage,
                        setSelectedContextualizationId,
                        setStoryIsSaved,
                        story,
                        summonAsset,
                        updateContextualizer,
                        updateDraftEditorsStates,
                        updateDraftEditorState,
                        updateResource,
                        uploadResource,
                        userId,
                      }
                    }
                    activeSection={ section }
                    assetRequestContentId={ assetRequestState.editorId }
                    assetRequestPosition={ assetRequestState.selection }
                    cancelAssetRequest={ unpromptAssetEmbed }
                    disablePaste={ ( userLockedResourceId || mainColumnMode !== 'edit' ) && !editorFocus }
                    editorOffset={ editorX }
                    requestAsset={ promptAssetEmbed }
                    sectionId={ section.id }
                    startExistingResourceConfiguration={ handleStartExistingResourceConfiguration }
                    startNewResourceConfiguration={ handleStartNewResourceConfiguration }
                    style={ { height: '100%' } }
                    updateSection={ handleUpdateSection }
                  />

                </Column>
              </StretchedLayoutItem>
              <StretchedLayoutItem className={ 'editor-footer' }>
                <Column
                  style={ { paddingTop: 0 } }
                  isSize={ editorWidth }
                  isOffset={ editorX }
                >
                  <Column style={ { paddingTop: 0 } }>
                    <StretchedLayoutContainer isDirection={ 'horizontal' }>
                      <StretchedLayoutItem isFlex={ 1 }>
                        <a onClick={ handleOpenShortcutsHelp }>{t( 'shortcuts help' )}</a>
                      </StretchedLayoutItem>
                      <StretchedLayoutItem style={ { textAlign: 'right' } }>
                        <i>{storyIsSaved ? translate( 'All changes saved' ) : translate( 'Saving...' )}</i>
                      </StretchedLayoutItem>
                    </StretchedLayoutContainer>
                  </Column>
                </Column>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          </Column>

        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    </Column>
  );
};

MainSectionColumn.contextTypes = {
  t: PropTypes.func,
};

export default MainSectionColumn;
