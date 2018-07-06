import React from 'react';

import {v4 as genId} from 'uuid';
import {isEmpty} from 'lodash';

import {arrayMove} from 'react-sortable-hoc';

import objectPath from 'object-path';

import resourceSchema from 'quinoa-schemas/resource';

import {
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

import {
  EditorState,
  convertToRaw,
  Modifier
} from 'draft-js';


import {createDefaultSection} from '../../../helpers/schemaUtils';
import {
  getReverseSectionsLockMap,
  checkIfUserHasLockOnSection,
  getReverseResourcesLockMap,
  getUserResourceLockId,
  getCitedSections,
} from '../../../helpers/lockUtils';

import AsideSectionColumn from './AsideSectionColumn';
import MainSectionColumn from './MainSectionColumn';

import ConfirmToDeleteModal from '../../../components/ConfirmToDeleteModal';
import LoadingScreen from '../../../components/LoadingScreen';


const SectionViewLayout = ({
  asideTabMode,
  asideTabCollapsed,
  mainColumnMode,
  newResourceMode,
  resourceOptionsVisible,
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
    setResourceOptionsVisible,
    setResourceFilterValues,
    setResourceSortValue,
    setResourceSearchString,
    setNewResourceMode,

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

  const {id: storyId, resources, contextualizations} = story;
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

  const reverseResourcesSectionsMap =
    Object.keys(contextualizations)
    .reduce((result, contextId) => {
      const context = contextualizations[contextId];
      const activeCitedSections =
        getCitedSections(contextualizations, context.resourceId)
          .filter(id => {
            return (reverseSectionLockMap[id] && reverseSectionLockMap[id].userId !== userId);
          });
      if (activeCitedSections.length > 0) {
        return {
          ...result,
          [context.resourceId]: {name: `other ${activeCitedSections.length} sections`}
        };
      }
      return result;
    }, {});

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
    setMainColumnMode('edition');
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

  /**
   * Delete all mentions of a contextualization
   * (and do not delete the contextualization itself to avoid inconsistencies
   * and breaking undo/redo stack)
   */
  const deleteContextualizationFromId = (contextualizationId) => {
    const contextualization = story.contextualizations[contextualizationId];
    const {id} = contextualization;
    let entityKey;
    let entity;
    let eData;
    let newEditorState;
    let contentId;
    // we dont know in advance for sure which editor is target by the contextualization
    // so we iterate through main editor state + notes editor states
    // (we could guess it but this is more safe)
    Object.keys(editorStates)
      .find(key => {
        const editorState = editorStates[key];
        let found;
        const contentState = editorState.getCurrentContent();
        // we need to iterate through all blocks
        // find = stop when found (even if we do not care about the returned value)
        contentState.getBlockMap().find(thatBlock => {
          // iterate through each character
          return thatBlock.getCharacterList().find(char => {
            // if there is an entity
            if (char.entity) {
              entityKey = char.entity;
              entity = contentState.getEntity(entityKey);
              eData = entity.toJS();
              // and if the entity is the right one
              if (eData.data && eData.data.asset && eData.data.asset.id === id) {
                found = true;
                // then find total entity range
                thatBlock.findEntityRanges(
                  metadata => {
                    return metadata.getEntity() === entityKey;
                  },
                  // ounce found
                  (start, end) => {
                    // delimitate its selection
                    const selectionState = editorState.getSelection().merge({
                      anchorKey: thatBlock.getKey(),
                      focusKey: thatBlock.getKey(),
                      anchorOffset: start,
                      focusOffset: end,
                    });
                    // and remove entity from this range
                    newEditorState = EditorState.push(
                      editorState,
                      Modifier.applyEntity(
                        contentState,
                        selectionState,
                        null
                      ),
                      'remove-entity'
                    );
                    // then update
                    contentId = key;
                    if (newEditorState && contentId) {
                      // apply change
                      const newSection = contentId === 'main' ? {
                        ...section,
                        contents: convertToRaw(newEditorState.getCurrentContent())
                      } : {
                        ...section,
                        notes: {
                          ...section.notes,
                          [contentId]: {
                            ...section.notes[contentId],
                            contents: convertToRaw(newEditorState.getCurrentContent())
                          }
                        }
                      };
                      // update section
                      onUpdateSection(newSection);
                      // update real time editor state
                      updateDraftEditorState(contentId, newEditorState);
                    }
                  }
                );

                return true;
              }
            }

          });
        });
        return found;
      });
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
    <StretchedLayoutContainer isAbsolute isFluid isDirection="horizontal">
      <StretchedLayoutItem className="is-hidden-mobile" isFlex={1}>
        <AsideSectionColumn
          asideTabCollapsed={asideTabCollapsed}
          asideTabMode={asideTabMode}
          mainColumnMode={mainColumnMode}
          resourceOptionsVisible={resourceOptionsVisible}
          story={story}
          sections={sectionsList}

          getResourceTitle={getResourceTitle}

          userId={userId}
          lockingMap={lockingMap}
          activeUsers={activeUsers}
          reverseResourcesLockMap={isEmpty(reverseResourcesLockMap) ? reverseResourcesSectionsMap : reverseResourcesLockMap}
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
          setResourceOptionsVisible={setResourceOptionsVisible}
          setAsideTabMode={setAsideTabMode}
          setAsideTabCollapsed={setAsideTabCollapsed}
          setMainColumnMode={setMainColumnMode}
          onSortEnd={onSectionsSortEnd}

          onDeleteSection={onDeleteSection} />
      </StretchedLayoutItem>
      <StretchedLayoutItem isFlex={asideTabCollapsed ? 11 : 3}>
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

            newResourceMode={newResourceMode}

            onNewSectionSubmit={onNewSectionSubmit}

            updateSection={onUpdateSection}

            promptAssetEmbed={promptAssetEmbed}
            unpromptAssetEmbed={unpromptAssetEmbed}
            setEditorFocus={setEditorFocus}

            setNewResourceMode={setNewResourceMode}

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

            onOpenSectionSettings={onOpenSectionSettings}
            submitMultiResources={submitMultiResources}

            setAssetRequestContentId={setAssetRequestContentId}
            startNewResourceConfiguration={startNewResourceConfiguration}
            startExistingResourceConfiguration={startExistingResourceConfiguration}
            summonAsset={summonAsset} />
            : <LoadingScreen />
        }
      </StretchedLayoutItem>

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
    </StretchedLayoutContainer>
  );
};

export default SectionViewLayout;
