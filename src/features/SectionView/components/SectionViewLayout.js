import React from 'react';

import {v4 as genId} from 'uuid';

import {arrayMove} from 'react-sortable-hoc';

import objectPath from 'object-path';

import resourceSchema from 'quinoa-schemas/resource';

import {
  Columns,
} from 'quinoa-design-library/components/';


import {createDefaultSection} from '../../../helpers/schemaUtils';
import {
  getReverseSectionsLockMap,
  checkIfUserHasLockOnSection,
  getReverseResourcesLockMap,
  getUserResourceLockId,
} from '../../../helpers/lockUtils';

import AsideSectionColumn from './AsideSectionColumn';
import MainSectionColumn from './MainSectionColumn';

import ConfirmToDeleteModal from '../../../components/ConfirmToDeleteModal';
import LoadingScreen from '../../../components/LoadingScreen';


const SectionViewLayout = ({
  asideTabMode,
  asideTabCollapsed,
  mainColumnMode,
  resourceSortVisible,
  resourceFilterVisible,
  resourceFilterValues,
  resourceSortValue,
  resourceSearchString,

  lockingMap = {},
  activeUsers,
  userId,
  promptedToDeleteSectionId,
  promptedToDeleteResourceId,

  editorStates,
  editorFocus,
  assetRequestState,

  story,
  section,

  embedResourceAfterCreation,
  newResourceType,
  actions: {
    setAsideTabMode,
    setAsideTabCollapsed,
    setMainColumnMode,
    setResourceSortVisible,
    setResourceFilterVisible,
    setResourceFilterValues,
    setResourceSortValue,
    setResourceSearchString,

    setPromptedToDeleteSectionId,
    setPromptedToDeleteResourceId,

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

    updateDraftEditorState,
    updateDraftEditorsStates,

    updateContextualizer,
    updateResource,
    deleteContextualization,
    deleteContextualizer,
    deleteResource,
    deleteUploadedResource,

    setAssetRequestContentId,

    setNewResourceType,
    setEmbedResourceAfterCreation,
  },
  goToSection,
  summonAsset,
  submitMultiResources,
  embedLastResource,
}) => {

  const {id: storyId, resources} = story;
  const {id: sectionId} = section;
  const defaultSection = createDefaultSection();

  const reverseSectionLockMap = getReverseSectionsLockMap(lockingMap, activeUsers, storyId);
  const hasLockOnSection = checkIfUserHasLockOnSection(lockingMap, userId, storyId, sectionId);
  const userLockedResourceId = getUserResourceLockId(lockingMap, userId, storyId);
  const reverseResourcesLockMap = getReverseResourcesLockMap(lockingMap, activeUsers, storyId);

  const sectionsList = story.sectionsOrder
  .map(thatSectionId => {
    let lockStatus;
    if (reverseSectionLockMap[thatSectionId]) {
      if (reverseSectionLockMap[thatSectionId].userId === userId) {
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
  });

  const activeFilters = Object.keys(resourceFilterValues).filter(key => resourceFilterValues[key]);
  const resourcesList = Object.keys(resources).map(resourceId => resources[resourceId]);

  const getResourceTitle = (resource) => {
    const titlePath = objectPath.get(resourceSchema, ['definitions', resource.metadata.type, 'title_path']);
    const title = titlePath ? objectPath.get(resource, titlePath) : resource.metadata.title;
    return title;
  };

  const visibleResources = resourcesList
    .filter(resource => {
      if (activeFilters.indexOf(resource.metadata.type) > -1) {
        if (resourceSearchString.length) {
         return JSON.stringify(resource).toLowerCase().indexOf(resourceSearchString.toLowerCase()) > -1;
        }
        return true;
      }
      return false;
    })
    .sort((a, b) => {
        switch (resourceSortValue) {
          case 'edited recently':
            if (a.lastUpdateAt > b.lastUpdateAt) {
              return -1;
            }
            return 1;
          case 'title':
          default:
            const aTitle = getResourceTitle(a);
            const bTitle = getResourceTitle(b);
            if ((aTitle && bTitle) && aTitle.toLowerCase().trim() > bTitle.toLowerCase().trim()) {
              return 1;
            }
            return -1;
        }
      });

  const onNewSectionSubmit = (metadata) => {
    const newSection = {
      ...defaultSection,
      metadata,
      id: genId()
    };

    createSection({
      section: newSection,
      sectionId: newSection.id,
      storyId,
      userId
    });
    setMainColumnMode('edit');
    goToSection(newSection.id);
  };

  /**
   * DELETE SECTION MANAGEMENT
   */

  // if modal to delete section was prompted and in the meantime someone has entered this section
  // then we unset the delete prompt on that section
  if (promptedToDeleteSectionId && reverseSectionLockMap[promptedToDeleteSectionId]) {
    setPromptedToDeleteSectionId(undefined);
  }

  const onDeleteSection = thatSectionId => {
    setPromptedToDeleteSectionId(thatSectionId);
  };

  const onDeleteResource = thatResourceId => {
    setPromptedToDeleteResourceId(thatResourceId);
  };
  const actuallyDeleteSection = thatSectionId => {
    // make sure that section is not edited by another user to prevent bugs and inconsistencies
    // (in UI delete button should be disabled when section is edited, this is a supplementary safety check)
    if (!reverseSectionLockMap[thatSectionId]) {
      deleteSection({
        sectionId: thatSectionId,
        storyId,
        userId,
        blockId: thatSectionId,
        blockType: 'sections',
      });
    }
  };

  const onDeleteSectionConfirm = () => {
    actuallyDeleteSection(promptedToDeleteSectionId);
    setPromptedToDeleteSectionId(undefined);
  };

  const onDeleteResourceConfirm = () => {
    const resource = resources[promptedToDeleteResourceId];
    const payload = {
      storyId,
      userId,
      resourceId: resource.id
    };
    if (resource.metadata.type === 'image' || resource.metadata.type === 'table') {
      deleteUploadedResource(payload);
    }
    else {
      deleteResource(payload);
    }
    setPromptedToDeleteResourceId(undefined);
  };

  const onOpenSectionSettings = () => {
    setMainColumnMode('editmetadata');
  };

  const onSectionsSortEnd = ({oldIndex, newIndex}) => {
    const sectionsIds = sectionsList.map(thatSection => thatSection.id);
    const newSectionsOrder = arrayMove(sectionsIds, oldIndex, newIndex);

    updateSectionsOrder({
      storyId,
      userId,
      sectionsOrder: newSectionsOrder,
    });
  };

  const onUpdateSection = thatSection => {
    if (thatSection && reverseSectionLockMap[thatSection.id] && reverseSectionLockMap[thatSection.id].userId === userId) {
      updateSection({
        sectionId,
        storyId,
        userId,

        section: thatSection,
      });
    }
  };

  const onResourceEditAttempt = resourceId => {
     enterBlock({
      storyId,
      userId,
      blockType: 'resources',
      blockId: resourceId
    });
  };

  const startExistingResourceConfiguration = resourceId => onResourceEditAttempt(resourceId);
  const startNewResourceConfiguration = (toEmbedResourceAfterCreation, resourceType) => {
    setEmbedResourceAfterCreation(toEmbedResourceAfterCreation);
    setNewResourceType(resourceType);
    setMainColumnMode('newresource');
  };

  const deleteContextualizationFromId = contextualizationId => {
    deleteContextualization({
      contextualizationId,
      storyId,
      userId,
    });
    // console.log('delete contextualization from id', contextualizationId);
  };

  const onCreateResource = payload => {
    createResource(payload);
    if (embedResourceAfterCreation) {
      setTimeout(() => {
          embedLastResource();
        });
    }
  };

  return (
    <div>
      <Columns isFullHeight>
        <AsideSectionColumn
          asideTabCollapsed={asideTabCollapsed}
          asideTabMode={asideTabMode}
          mainColumnMode={mainColumnMode}
          resourceSortVisible={resourceSortVisible}
          resourceFilterVisible={resourceFilterVisible}
          story={story}
          sections={sectionsList}

          getResourceTitle={getResourceTitle}

          userId={userId}
          reverseResourcesLockMap={reverseResourcesLockMap}
          userLockedResourceId={userLockedResourceId}

          visibleResources={visibleResources}
          resourceSearchString={resourceSearchString}
          setResourceSearchString={setResourceSearchString}
          resourceFilterValues={resourceFilterValues}
          setResourceFilterValues={setResourceFilterValues}
          resourceSortValue={resourceSortValue}
          setResourceSortValue={setResourceSortValue}

          onDeleteResource={onDeleteResource}
          submitMultiResources={submitMultiResources}

          onResourceEditAttempt={onResourceEditAttempt}

          onOpenSectionSettings={onOpenSectionSettings}
          setResourceSortVisible={setResourceSortVisible}
          setResourceFilterVisible={setResourceFilterVisible}
          setAsideTabMode={setAsideTabMode}
          setAsideTabCollapsed={setAsideTabCollapsed}
          setMainColumnMode={setMainColumnMode}
          onSortEnd={onSectionsSortEnd}

          onDeleteSection={onDeleteSection} />
        {hasLockOnSection ?
          <MainSectionColumn
            userLockedResourceId={userLockedResourceId}
            mainColumnMode={mainColumnMode}
            setMainColumnMode={setMainColumnMode}
            section={section}
            story={story}
            userId={userId}
            defaultSectionMetadata={defaultSection.metadata}
            editorStates={editorStates}
            editorFocus={editorFocus}
            assetRequestState={assetRequestState}

            onNewSectionSubmit={onNewSectionSubmit}

            updateSection={onUpdateSection}

            promptAssetEmbed={promptAssetEmbed}
            unpromptAssetEmbed={unpromptAssetEmbed}
            setEditorFocus={setEditorFocus}

            newResourceType={newResourceType}

            createContextualization={createContextualization}
            createContextualizer={createContextualizer}
            createResource={onCreateResource}

            enterBlock={enterBlock}
            leaveBlock={leaveBlock}

            updateDraftEditorState={updateDraftEditorState}
            updateDraftEditorsStates={updateDraftEditorsStates}

            updateContextualizer={updateContextualizer}
            updateResource={updateResource}
            deleteContextualization={deleteContextualization}
            deleteContextualizer={deleteContextualizer}
            deleteContextualizationFromId={deleteContextualizationFromId}

            setAssetRequestContentId={setAssetRequestContentId}
            startNewResourceConfiguration={startNewResourceConfiguration}
            startExistingResourceConfiguration={startExistingResourceConfiguration}
            summonAsset={summonAsset} />
            : <LoadingScreen />
        }
        {
          promptedToDeleteSectionId &&
          !reverseSectionLockMap[promptedToDeleteSectionId] &&
          <ConfirmToDeleteModal
            isActive={promptedToDeleteSectionId}
            deleteType={'section'}
            story={story}
            id={promptedToDeleteSectionId}
            onClose={() => setPromptedToDeleteSectionId(undefined)}
            onDeleteConfirm={onDeleteSectionConfirm} />
        }
        {
          promptedToDeleteResourceId &&
          <ConfirmToDeleteModal
            isActive={promptedToDeleteResourceId}
            deleteType={'resource'}
            story={story}
            id={promptedToDeleteResourceId}
            onClose={() => setPromptedToDeleteResourceId(undefined)}
            onDeleteConfirm={onDeleteResourceConfirm} />
        }
      </Columns>
    </div>
  );
};

export default SectionViewLayout;
