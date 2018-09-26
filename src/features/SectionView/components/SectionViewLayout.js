/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { v4 as genId } from 'uuid';
import { isEmpty } from 'lodash';
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
  onContextualizeHyperlink: handleContextualizeHyperlink,
  onResourceEditAttempt: handleResourceEditAttempt,
  history,
}, { t } ) => {

  const translate = translateNameSpacer( t, 'Features.SectionView' );

  // console.time('preparation');

  const {
    id: storyId,
    resources,
    contextualizations,
    sectionsOrder,
  } = story;
  const { id: sectionId } = section;
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
          [context.resourceId]: { name: `other ${activeCitedSections.length} sections` }
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
        return activeFilters.indexOf( resource.metadata.type ) > -1;
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

  // console.timeEnd('preparation');

  /**
   * Callbacks
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

  /**
   * DELETE SECTION MANAGEMENT
   */

  /*
   * if modal to delete section was prompted and in the meantime someone has entered this section
   * then we unset the delete prompt on that section
   */
  if ( promptedToDeleteSectionId && reverseSectionLockMap[promptedToDeleteSectionId] ) {
    setPromptedToDeleteSectionId( undefined );
  }

  const handleDeleteSection = ( thatSectionId ) => {
    setPromptedToDeleteSectionId( thatSectionId );
  };

  const handleDeleteResource = ( thatResourceId ) => {
    setPromptedToDeleteResourceId( thatResourceId );
  };
  const actuallyDeleteSection = ( thatSectionId ) => {

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
    actuallyDeleteSection( promptedToDeleteSectionId );
    setPromptedToDeleteSectionId( undefined );
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
    const relatedContextualizationsSectionIds = relatedContextualizations.map( ( c ) => c.sectionId );

    const changedContentStates = {};
    if ( relatedContextualizationsIds.length ) {
      relatedContextualizationsSectionIds.forEach( ( key ) => {
        const thatSection = story.sections[key];
        if ( !thatSection ) return;
        let sectionChanged;
        let newSection;
        // resource is cited in this section view
        if ( Object.keys( editorStates ).indexOf( key ) !== -1 ) {
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
  const setSectionIndex = ( oldIndex, newIndex ) => {
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

  const startExistingResourceConfiguration = ( resourceId ) => handleResourceEditAttempt( resourceId );
  const startNewResourceConfiguration = ( toEmbedResourceAfterCreation, resourceType ) => {
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
          activeUsers={ activeUsers }
          asideTabCollapsed={ asideTabCollapsed }
          asideTabMode={ asideTabMode }
          getResourceTitle={ getResourceTitle }
          history={ history }
          lockingMap={ lockingMap }
          mainColumnMode={ mainColumnMode }
          onCloseActiveResource={ handleCloseActiveResource }
          onCloseSectionSettings={ handleCloseSectionSettings }
          onDeleteResource={ handleDeleteResource }
          onDeleteSection={ handleDeleteSection }
          onOpenSectionSettings={ handleOpenSectionSettings }
          onResourceEditAttempt={ handleResourceEditAttempt }
          onSetCoverImage={ handleSetCoverImage }
          onSortEnd={ handleSectionsSortEnd }
          resourceFilterValues={ resourceFilterValues }
          resourceOptionsVisible={ resourceOptionsVisible }
          resourceSearchString={ resourceSearchString }
          resourceSortValue={ resourceSortValue }
          reverseResourcesLockMap={ isEmpty( reverseResourcesLockMap ) ? reverseResourcesSectionsMap : reverseResourcesLockMap }
          sections={ sectionsList }
          setAsideTabCollapsed={ setAsideTabCollapsed }
          setAsideTabMode={ setAsideTabMode }
          setEditorFocus={ handleSetEditorFocus }
          setMainColumnMode={ setMainColumnMode }
          setResourceFilterValues={ setResourceFilterValues }
          setResourceOptionsVisible={ setResourceOptionsVisible }
          setResourceSearchString={ setResourceSearchString }
          setResourceSortValue={ setResourceSortValue }
          setSectionIndex={ setSectionIndex }
          setSectionLevel={ handleSetSectionLevel }
          story={ story }
          submitMultiResources={ submitMultiResources }
          userId={ userId }
          userLockedResourceId={ userLockedResourceId }
          visibleResources={ visibleResources }
        />
      </StretchedLayoutItem>
      <StretchedLayoutItem isFlex={ asideTabCollapsed ? 11 : 3 }>
        {hasLockOnSection ?
          <MainSectionColumn
            userLockedResourceId={ userLockedResourceId }
            mainColumnMode={ mainColumnMode }
            setMainColumnMode={ setMainColumnMode }
            section={ section }
            story={ story }
            userId={ userId }
            selectedContextualizationId={ selectedContextualizationId }
            setSelectedContextualizationId={ handleSetSelectedContextualizationId }
            defaultSectionMetadata={ defaultSection.metadata }
            editorStates={ editorStates }
            editorFocus={ editorFocus }
            previousEditorFocus={ previousEditorFocus }
            assetRequestState={ assetRequestState }
            draggedResourceId={ draggedResourceId }
            setShortcutsHelpVisible={ setShortcutsHelpVisible }
            uploadStatus={ uploadStatus }

            setUploadStatus={ setUploadStatus }

            newResourceMode={ newResourceMode }

            onNewSectionSubmit={ handleNewSectionSubmit }

            updateSection={ handleUpdateSection }

            promptAssetEmbed={ promptAssetEmbed }
            unpromptAssetEmbed={ unpromptAssetEmbed }
            setEditorFocus={ handleSetEditorFocus }

            setNewResourceMode={ setNewResourceMode }

            newResourceType={ newResourceType }
            storyIsSaved={ storyIsSaved }

            editorPastingStatus={ editorPastingStatus }
            setEditorPastingStatus={ setEditorPastingStatus }

            createContextualization={ createContextualization }
            createContextualizer={ createContextualizer }
            createResource={ handleCreateResource }
            uploadResource={ uploadResource }

            enterBlock={ enterBlock }
            leaveBlock={ leaveBlock }

            updateDraftEditorState={ updateDraftEditorState }
            updateDraftEditorsStates={ updateDraftEditorsStates }

            updateContextualizer={ updateContextualizer }
            updateResource={ updateResource }
            deleteContextualization={ deleteContextualization }
            deleteContextualizer={ deleteContextualizer }
            deleteContextualizationFromId={ handleDeleteContextualizationFromId }

            onOpenSectionSettings={ handleOpenSectionSettings }
            submitMultiResources={ submitMultiResources }

            setAssetRequestContentId={ setAssetRequestContentId }
            startNewResourceConfiguration={ startNewResourceConfiguration }
            startExistingResourceConfiguration={ startExistingResourceConfiguration }
            setStoryIsSaved={ setStoryIsSaved }
            setErrorMessage={ setErrorMessage }
            summonAsset={ summonAsset }
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
