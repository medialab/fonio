/**
 * This module provides a layout component for displaying the section view
 * @module fonio/features/SectionView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { v4 as genId } from 'uuid';
import { isEmpty, uniq } from 'lodash';
import { arrayMove } from 'react-sortable-hoc';
import {
  convertToRaw,
  EditorState,
  convertFromRaw,
} from 'draft-js';
import {
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  removeContextualizationReferenceFromRawContents
} from '../../../helpers/assetsUtils';

import { createDefaultSection } from '../../../helpers/schemaUtils';
import { deleteContextualizationFromId } from '../../../helpers/assetsUtils';
import { getResourceTitle, searchResources } from '../../../helpers/resourcesUtils';
import {
  getReverseSectionsLockMap,
  checkIfUserHasLockOnSection,
  getReverseResourcesLockMap,
  getUserResourceLockId,
  getCitedSections,
} from '../../../helpers/lockUtils';

/**
 * Imports Components
 */
import AsideSectionColumn from './AsideSectionColumn';
import MainSectionColumn from './MainSectionColumn';
import ShortcutsModal from './ShortcutsModal';

import ConfirmToDeleteModal from '../../../components/ConfirmToDeleteModal';
import LoadingScreen from '../../../components/LoadingScreen';
import LinkModal from '../../../components/LinkModal';
import GlossaryModal from '../../../components/GlossaryModal';
import InternalLinkModal from '../../../components/InternalLinkModal';

const SectionViewLayout = ( {
  asideTabMode,
  asideTabCollapsed,
  mainColumnMode,
  newResourceMode,
  resourceOptionsVisible,
  resourceFilterValues,
  resourceSortValue,
  resourceSearchString,
  linkModalFocusData,
  glossaryModalFocusData,
  internalLinkModalFocusData,
  previousEditorFocus,

  lockingMap = {},
  activeUsers,
  userId,
  promptedToDeleteSectionId,
  promptedToDeleteResourceId,

  editorStates,
  editorFocus,
  assetRequestState,
  draggedResourceId,
  shortcutsHelpVisible,
  editorPastingStatus,

  story,
  section,

  embedResourceAfterCreation,
  newResourceType,
  storyIsSaved,
  selectedContextualizationId,
  uploadStatus,
  inactiveSections,

  actions: {
    setAsideTabMode,
    setAsideTabCollapsed,
    setMainColumnMode,
    setResourceOptionsVisible,
    setResourceFilterValues,
    setResourceSortValue,
    setResourceSearchString,
    setNewResourceMode,
    setLinkModalFocusData,
    setGlossaryModalFocusData,
    setInternalLinkModalFocusData,
    setEditorPastingStatus,

    setPromptedToDeleteSectionId,
    setPromptedToDeleteResourceId,
    setUploadStatus,

    updateSection,
    createSection,
    deleteSection,
    updateSectionsOrder,
    promptAssetEmbed,
    unpromptAssetEmbed,
    setEditorFocus,

    enterBlock,
    leaveBlock,

    createContextualization,
    createContextualizer,
    createResource,
    uploadResource,
    setCoverImage,
    setSectionLevel,

    updateDraftEditorState,
    updateDraftEditorsStates,

    updateContextualizer,
    updateResource,
    deleteContextualization,
    deleteContextualizer,
    deleteResource,
    deleteUploadedResource,

    setAssetRequestContentId,
    setShortcutsHelpVisible,
    setNewResourceType,
    setEmbedResourceAfterCreation,
    setStoryIsSaved,
    setErrorMessage,
    setSelectedContextualizationId,
  },
  goToSection,
  summonAsset,
  submitMultiResources,
  embedLastResource,
  onCreateHyperlink: handleCreateHyperlink,
  onCreateInternalLink: handleCreateInternalLink,
  onCreateGlossary: handleCreateGlossary,

  onContextualizeHyperlink: handleContextualizeHyperlink,
  onContextualizeGlossary: handleContextualizeGlossary,
  onResourceEditAttempt: handleResourceEditAttempt,
  history,
}, { t } ) => {

  /**
   * Variables definition
   */
  const {
    id: storyId,
    resources,
    contextualizations,
    sectionsOrder,
  } = story;
  const { id: sectionId } = section;

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.SectionView' );

  /**
   * Computed variables
   */
  const defaultSection = createDefaultSection();
  const reverseSectionLockMap = getReverseSectionsLockMap( lockingMap, activeUsers, storyId );
  const hasLockOnSection = checkIfUserHasLockOnSection( lockingMap, userId, storyId, sectionId );
  const userLockedResourceId = getUserResourceLockId( lockingMap, userId, storyId );
  const reverseResourcesLockMap = getReverseResourcesLockMap( lockingMap, activeUsers, storyId );

  const sectionsList = story.sectionsOrder
  .map( ( thatSectionId ) => {
    let lockStatus;
    if ( reverseSectionLockMap[thatSectionId] ) {
      if ( reverseSectionLockMap[thatSectionId].userId === userId ) {
        lockStatus = 'active';
      }
      else {
        lockStatus = 'locked';
      }
    }
    else {
      lockStatus = 'open';
    }
    return {
      ...story.sections[thatSectionId],
      lockData: reverseSectionLockMap[thatSectionId],
      lockStatus
    };
  } );

  const reverseResourcesSectionsMap =
    Object.keys( contextualizations )
    .reduce( ( result, contextId ) => {
      const context = contextualizations[contextId];
      const activeCitedSections =
        getCitedSections( contextualizations, context.resourceId )
          .filter( ( id ) => {
            return ( reverseSectionLockMap[id] && reverseSectionLockMap[id].userId !== userId );
          } );
      if ( activeCitedSections.length > 0 ) {
        return {
          ...result,
          [context.resourceId]: { name: activeCitedSections.length === 1 ?
            translate( 'another author in one section' ) : translate( 'other authors in multiple sections' )
          }
        };
      }
      return result;
    }, {} );

  const activeFilters = Object.keys( resourceFilterValues ).filter( ( key ) => resourceFilterValues[key] );
  const resourcesList = Object.keys( resources ).map( ( resourceId ) => resources[resourceId] );

  let visibleResources = resourceSearchString.length === 0 ? resourcesList : searchResources( resourcesList, resourceSearchString );
  visibleResources = visibleResources
    .filter( ( resource ) => {
      if ( activeFilters.length ) {
        return activeFilters.includes( resource.metadata.type );
      }
      return true;
    } )
    .sort( ( a, b ) => {
        switch ( resourceSortValue ) {
          case 'edited recently':
            if ( a.lastUpdateAt > b.lastUpdateAt ) {
              return -1;
            }
            return 1;
          case 'title':
          default:
            const aTitle = getResourceTitle( a );
            const bTitle = getResourceTitle( b );
            if ( ( aTitle && bTitle ) && aTitle.toLowerCase().trim() > bTitle.toLowerCase().trim() ) {
              return 1;
            }
            return -1;
        }
      } );
  const hyperlinks = linkModalFocusData ? Object.keys( story.resources )
    .filter( ( resourceId ) => story.resources[resourceId].metadata.type === 'webpage' )
    .map( ( resourceId ) => story.resources[resourceId] ) : [];
  const glossaryEntries = glossaryModalFocusData ? Object.keys( story.resources )
    .filter( ( resourceId ) => story.resources[resourceId].metadata.type === 'glossary' )
    .map( ( resourceId ) => story.resources[resourceId] ) : [];

  /**
   * Callbacks handlers
   */
  const handleNewSectionSubmit = ( metadata ) => {
    const newSection = {
      ...defaultSection,
      metadata: {
        ...metadata,
        level: section.metadata.level,
      },
      id: genId()
    };

    const currentSectionOrder = sectionsOrder.indexOf( section.id ) || 0;
    createSection( {
      section: newSection,
      sectionId: newSection.id,
      storyId,
      sectionOrder: currentSectionOrder + 1,
      userId
    }, ( err ) => {
      if ( !err ) {
        goToSection( newSection.id );
      }
    } );
    setMainColumnMode( 'edition' );
  };

  const handleDeleteSection = ( thatSectionId ) => {
    setPromptedToDeleteSectionId( thatSectionId );
  };

  const handleDeleteResource = ( thatResourceId ) => {
    setPromptedToDeleteResourceId( thatResourceId );
  };

  const handleDeleteResourceConfirm = () => {
    const resource = resources[promptedToDeleteResourceId];
    const payload = {
      storyId,
      userId,
      resourceId: resource.id
    };
    const relatedContextualizations = Object.keys( story.contextualizations ).map( ( c ) => story.contextualizations[c] )
        .filter( ( contextualization ) => {
          return contextualization.resourceId === promptedToDeleteResourceId;
        } );

    const relatedContextualizationsIds = relatedContextualizations.map( ( c ) => c.id );
    const relatedContextualizationsSectionIds = uniq( relatedContextualizations.map( ( c ) => c.sectionId ) );

    const changedContentStates = {};
    if ( relatedContextualizationsIds.length ) {
      relatedContextualizationsSectionIds.forEach( ( key ) => {
        const thatSection = story.sections[key];
        if ( !thatSection ) return;
        let sectionChanged;
        let newSection;
        // resource is cited in this section view
        if ( Object.keys( editorStates ).includes( key ) ) {
          const sectionContents = editorStates[thatSection.id] ? { ...convertToRaw( editorStates[thatSection.id].getCurrentContent() ) } : thatSection.contents;
          const notesContents = Object.keys( thatSection.notes ).reduce( ( res, noteId ) => ( {
            ...res,
            [noteId]: editorStates[noteId] ? convertToRaw( editorStates[noteId].getCurrentContent() ) : thatSection.notes[noteId].contents
          } ), {} );

          newSection = {
            ...thatSection,
            contents: relatedContextualizationsIds.reduce( ( temp, contId ) => {
              const { changed, result } = removeContextualizationReferenceFromRawContents( temp, contId );
              if ( changed && !sectionChanged ) {
                sectionChanged = true;
                changedContentStates[key] = result;
              }
              return result;
            }, { ...sectionContents } ),
            notes: Object.keys( thatSection.notes ).reduce( ( temp1, noteId ) => ( {
              ...temp1,
              [noteId]: {
                ...thatSection.notes[noteId],
                contents: relatedContextualizationsIds.reduce( ( temp, contId ) => {
                  const { changed, result } = removeContextualizationReferenceFromRawContents( temp, contId );
                  if ( changed && !sectionChanged ) {
                    sectionChanged = true;
                    changedContentStates[noteId] = result;
                  }
                  return result;
                }, { ...notesContents[noteId] } )
              }
            } ), {} )
          };
          // updating live editor states
          const newEditorStates = Object.keys( editorStates || {} )
            .reduce( ( res, contentId ) => ( {
              ...res,
              [contentId]: changedContentStates[contentId] ?
                EditorState.push(
                  editorStates[contentId],
                  convertFromRaw( changedContentStates[contentId] ),
                  'remove-entity'
                )
                 :
                editorStates[contentId]
            } ), {} );
          updateDraftEditorsStates( newEditorStates );
        }
        // resource is cited in other sections
        else {
          newSection = {
            ...thatSection,
            contents: relatedContextualizationsIds.reduce( ( temp, contId ) => {
              const { changed, result } = removeContextualizationReferenceFromRawContents( temp, contId );
              if ( changed && !sectionChanged ) {
                sectionChanged = true;
              }
              return result;
            }, thatSection.contents ),
            notes: Object.keys( thatSection.notes ).reduce( ( temp1, noteId ) => ( {
              ...temp1,
              [noteId]: {
                ...thatSection.notes[noteId],
                contents: relatedContextualizationsIds.reduce( ( temp, contId ) => {
                  const { changed, result } = removeContextualizationReferenceFromRawContents( temp, contId );
                  if ( changed && !sectionChanged ) {
                    sectionChanged = true;
                  }
                  return result;
                }, thatSection.notes[noteId].contents )
              }
            } ), {} )
          };
        }
        if ( sectionChanged ) {
          updateSection( {
            sectionId: thatSection.id,
            storyId: story.id,
            userId,
            section: newSection,
          } );
        }
      } );
    }

    if ( resource.metadata.type === 'image' || resource.metadata.type === 'table' ) {
      deleteUploadedResource( payload );
    }
    else {
      deleteResource( payload );
    }
    setPromptedToDeleteResourceId( undefined );
  };

  const handleDeleteSectionExecution = ( thatSectionId ) => {

    /*
     * make sure that section is not edited by another user to prevent bugs and inconsistencies
     * (in UI delete button should be disabled when section is edited, this is a supplementary safety check)
     */
    if ( !reverseSectionLockMap[thatSectionId] ) {
      deleteSection( {
        sectionId: thatSectionId,
        storyId,
        userId,
        blockId: thatSectionId,
        blockType: 'sections',
      } );
    }
  };

  const handleDeleteSectionConfirm = () => {
    handleDeleteSectionExecution( promptedToDeleteSectionId );
    setPromptedToDeleteSectionId( undefined );
  };

  const handleOpenSectionSettings = () => {
    setMainColumnMode( 'editmetadata' );
  };
  const handleCloseSectionSettings = () => {
    setMainColumnMode( 'edition' );
  };

  const handleCloseActiveResource = () => {
      leaveBlock( {
        storyId,
        userId,
        blockType: 'resources',
        blockId: userLockedResourceId
      } );
    };

  const handleSectionsSortEnd = ( { oldIndex, newIndex } ) => {
    const sectionsIds = sectionsList.map( ( thatSection ) => thatSection.id );
    const newSectionsOrder = arrayMove( sectionsIds, oldIndex, newIndex );

    updateSectionsOrder( {
      storyId,
      userId,
      sectionsOrder: newSectionsOrder,
    } );
  };
  const handleSectionIndexChange = ( oldIndex, newIndex ) => {
    const sectionsIds = sectionsList.map( ( thatSection ) => thatSection.id );
    const newSectionsOrder = arrayMove( sectionsIds, oldIndex, newIndex );

    updateSectionsOrder( {
      storyId,
      userId,
      sectionsOrder: newSectionsOrder,
    } );
  };

  const handleUpdateSection = ( thatSection, callback ) => {
    if ( thatSection && reverseSectionLockMap[thatSection.id] && reverseSectionLockMap[thatSection.id].userId === userId ) {
      updateSection( {
        sectionId,
        storyId,
        userId,

        section: thatSection,
      }, callback );
    }
  };

  const handleSetCoverImage = ( resourceId ) => {
    setCoverImage( {
      storyId,
      resourceId,
      userId
    } );
  };
  const handleStartExistingResourceConfiguration = ( resourceId ) => handleResourceEditAttempt( resourceId );
  const handleStartNewResourceConfiguration = ( toEmbedResourceAfterCreation, resourceType ) => {
    setEmbedResourceAfterCreation( toEmbedResourceAfterCreation );
    setNewResourceType( resourceType );
    setMainColumnMode( 'newresource' );
  };

  /**
   * Delete all mentions of a contextualization
   * (and do not delete the contextualization itself to avoid inconsistencies
   * and breaking undo/redo stack)
   */
  const handleDeleteContextualizationFromId = ( contextualizationId ) => {
    deleteContextualizationFromId( {
      editorStates,
      contextualization: story.contextualizations[contextualizationId],
      updateDraftEditorState,
      updateSection: handleUpdateSection,
      section
    } );
  };

  const handleCreateResource = ( payload, callback ) => {
    createResource( payload, callback );
    if ( embedResourceAfterCreation ) {
      // setTimeout(() => {
          embedLastResource();
        // });
    }
  };

  const handleSetSectionLevel = ( { sectionId: thatSectionId, level } ) => {
    setSectionLevel( {
      storyId,
      sectionId: thatSectionId,
      level,
      userId
    } );
  };

  const handleSetEditorFocus = ( editorId ) => {
    if ( selectedContextualizationId ) {
      setTimeout( () => setSelectedContextualizationId( undefined ) );
    }
    setEditorFocus( editorId );
  };

  const handleSetSelectedContextualizationId = ( contextualizationId ) => {
    setEditorFocus( undefined );
    setSelectedContextualizationId( contextualizationId );
  };

  const handleAbortDeleteSection = () => setPromptedToDeleteSectionId( undefined );
  const handleAbortDeleteResource = () => setPromptedToDeleteResourceId( undefined );
  const handleAbortLinkCreation = () => setLinkModalFocusData( undefined );
  const handleAbortGlossaryCreation = () => setGlossaryModalFocusData( undefined );
  const handleAbortInternalLinkCreation = () => setInternalLinkModalFocusData( undefined );
  const handleCloseShortcuts = () => setShortcutsHelpVisible( false );

  return (
    <StretchedLayoutContainer
      isAbsolute
      isFluid
      isDirection={ 'horizontal' }
    >
      <StretchedLayoutItem
        className={ `aside-edition-container ${asideTabCollapsed ? 'is-collapsed' : ''} is-hidden-mobile` }
        isFlex={ 1 }
      >
        <AsideSectionColumn
          {
            ...{
                  activeUsers,
                  asideTabCollapsed,
                  asideTabMode,
                  getResourceTitle,
                  handleSectionIndexChange,
                  history,
                  lockingMap,
                  mainColumnMode,
                  resourceFilterValues,
                  resourceOptionsVisible,
                  resourceSearchString,
                  resourceSortValue,
                  setAsideTabCollapsed,
                  setAsideTabMode,
                  setMainColumnMode,
                  setResourceFilterValues,
                  setResourceOptionsVisible,
                  setResourceSearchString,
                  setResourceSortValue,
                  story,
                  submitMultiResources,
                  userId,
                  userLockedResourceId,
                  visibleResources,
            }
          }
          sections={ sectionsList }
          setEditorFocus={ handleSetEditorFocus }
          reverseResourcesLockMap={ isEmpty( reverseResourcesLockMap ) ? reverseResourcesSectionsMap : reverseResourcesLockMap }
          setSectionLevel={ handleSetSectionLevel }
          onCloseActiveResource={ handleCloseActiveResource }
          onCloseSectionSettings={ handleCloseSectionSettings }
          onDeleteResource={ handleDeleteResource }
          onDeleteSection={ handleDeleteSection }
          onOpenSectionSettings={ handleOpenSectionSettings }
          onResourceEditAttempt={ handleResourceEditAttempt }
          onSetCoverImage={ handleSetCoverImage }
          onSortEnd={ handleSectionsSortEnd }
        />
      </StretchedLayoutItem>
      <StretchedLayoutItem isFlex={ asideTabCollapsed ? 11 : 3 }>
        {hasLockOnSection ?
          <MainSectionColumn
            {
              ...{
                assetRequestState,
                createContextualization,
                createContextualizer,
                deleteContextualization,
                deleteContextualizer,
                draggedResourceId,
                editorFocus,
                editorPastingStatus,
                editorStates,
                enterBlock,
                handleStartExistingResourceConfiguration,
                handleStartNewResourceConfiguration,
                internalLinkModalFocusData,
                leaveBlock,
                mainColumnMode,
                newResourceMode,
                newResourceType,
                previousEditorFocus,
                promptAssetEmbed,
                section,
                selectedContextualizationId,
                setAssetRequestContentId,
                setEditorPastingStatus,
                setErrorMessage,
                setInternalLinkModalFocusData,
                setMainColumnMode,
                setNewResourceMode,
                setShortcutsHelpVisible,
                setStoryIsSaved,
                setUploadStatus,
                story,
                storyIsSaved,
                submitMultiResources,
                summonAsset,
                unpromptAssetEmbed,
                updateContextualizer,
                updateDraftEditorState,
                updateDraftEditorsStates,
                updateResource,
                uploadResource,
                uploadStatus,
                userId,
                userLockedResourceId,
              }
            }

            setSelectedContextualizationId={ handleSetSelectedContextualizationId }
            defaultSectionMetadata={ defaultSection.metadata }
            onNewSectionSubmit={ handleNewSectionSubmit }
            updateSection={ handleUpdateSection }
            setEditorFocus={ handleSetEditorFocus }
            deleteContextualizationFromId={ handleDeleteContextualizationFromId }
            createResource={ handleCreateResource }
            onOpenSectionSettings={ handleOpenSectionSettings }
          />
            : <LoadingScreen />
        }
      </StretchedLayoutItem>

      {
          promptedToDeleteSectionId &&
          !reverseSectionLockMap[promptedToDeleteSectionId] &&
          <ConfirmToDeleteModal
            isActive={ promptedToDeleteSectionId !== undefined }
            deleteType={ 'section' }
            story={ story }
            id={ promptedToDeleteSectionId }
            onClose={ handleAbortDeleteSection }
            onDeleteConfirm={ handleDeleteSectionConfirm }
          />
        }
      {
          promptedToDeleteResourceId &&
          <ConfirmToDeleteModal
            isActive={ promptedToDeleteResourceId !== undefined }
            deleteType={ 'resource' }
            story={ story }
            id={ promptedToDeleteResourceId }
            onClose={ handleAbortDeleteResource }
            onDeleteConfirm={ handleDeleteResourceConfirm }
          />
        }
      <LinkModal
        isActive={ linkModalFocusData !== undefined }
        focusData={ linkModalFocusData }
        onClose={ handleAbortLinkCreation }
        hyperlinks={ hyperlinks }
        onCreateHyperlink={ handleCreateHyperlink }
        onContextualizeHyperlink={ handleContextualizeHyperlink }
      />
      <GlossaryModal
        isActive={ glossaryModalFocusData !== undefined }
        focusData={ glossaryModalFocusData }
        onClose={ handleAbortGlossaryCreation }
        glossaryEntries={ glossaryEntries }
        onCreateGlossary={ handleCreateGlossary }
        onContextualizeGlossary={ handleContextualizeGlossary }
      />
      <InternalLinkModal
        isActive={ internalLinkModalFocusData !== undefined }
        focusData={ internalLinkModalFocusData }
        onClose={ handleAbortInternalLinkCreation }
        inactiveSections={ inactiveSections }
        onCreateInternalLink={ handleCreateInternalLink }
      />
      <ShortcutsModal
        isActive={ shortcutsHelpVisible }
        translate={ translate }
        onClose={ handleCloseShortcuts }
      />
    </StretchedLayoutContainer>
  );
};

SectionViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default SectionViewLayout;
