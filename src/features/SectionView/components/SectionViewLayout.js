import React from 'react';
import PropTypes from 'prop-types';

import {v4 as genId} from 'uuid';
import {isEmpty} from 'lodash';

import {arrayMove} from 'react-sortable-hoc';


import {
  convertToRaw,
  EditorState,
  convertFromRaw,
} from 'draft-js';

import {
  StretchedLayoutContainer,
  StretchedLayoutItem,
  ModalCard,
} from 'quinoa-design-library/components/';

import {translateNameSpacer} from '../../../helpers/translateUtils';


import {
  removeContextualizationReferenceFromRawContents
} from '../../../helpers/assetsUtils';

import {createDefaultSection} from '../../../helpers/schemaUtils';
import {deleteContextualizationFromId} from '../../../helpers/assetsUtils';
import {getResourceTitle, searchResources} from '../../../helpers/resourcesUtils';

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
  draggedResourceId,
  shortcutsHelpVisible,

  story,
  section,

  embedResourceAfterCreation,
  newResourceType,
  storyIsSaved,
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
    setEditorBlocked,

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
  },
  goToSection,
  summonAsset,
  submitMultiResources,
  embedLastResource,
}, {t}) => {

  const translate = translateNameSpacer(t, 'Features.SectionView');

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

  let visibleResources = resourceSearchString.length === 0 ? resourcesList : searchResources(resourcesList, resourceSearchString);
  visibleResources = visibleResources
    .filter(resource => {
      return activeFilters.indexOf(resource.metadata.type) > -1;
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
    const relatedContextualizations = Object.keys(story.contextualizations).map(c => story.contextualizations[c])
        .filter(contextualization => {
          return contextualization.resourceId === promptedToDeleteResourceId;
        });

    const relatedContextualizationsIds = relatedContextualizations.map(c => c.id);
    const relatedContextualizationsSectionIds = relatedContextualizations.map(c => c.sectionId);

    const changedContentStates = {};
    if (relatedContextualizationsIds.length) {
      relatedContextualizationsSectionIds.forEach(key => {
        const thatSection = story.sections[key];
        if (!thatSection) return;
        let sectionChanged;
        let newSection;
        // resource is cited in this section view
        if (Object.keys(editorStates).indexOf(key) !== -1) {
          const sectionContents = editorStates[thatSection.id] ? {...convertToRaw(editorStates[thatSection.id].getCurrentContent())} : thatSection.contents;
          const notesContents = Object.keys(thatSection.notes).reduce((res, noteId) => ({
            ...res,
            [noteId]: editorStates[noteId] ? convertToRaw(editorStates[noteId].getCurrentContent()) : thatSection.notes[noteId].contents
          }), {});

          newSection = {
            ...thatSection,
            contents: relatedContextualizationsIds.reduce((temp, contId) => {
              const {changed, result} = removeContextualizationReferenceFromRawContents(temp, contId);
              if (changed && !sectionChanged) {
                sectionChanged = true;
                changedContentStates[key] = result;
              }
              return result;
            }, {...sectionContents}),
            notes: Object.keys(thatSection.notes).reduce((temp1, noteId) => ({
              ...temp1,
              [noteId]: {
                ...thatSection.notes[noteId],
                contents: relatedContextualizationsIds.reduce((temp, contId) => {
                  const {changed, result} = removeContextualizationReferenceFromRawContents(temp, contId);
                  if (changed && !sectionChanged) {
                    sectionChanged = true;
                    changedContentStates[noteId] = result;
                  }
                  return result;
                }, {...notesContents[noteId]})
              }
            }), {})
          };
          // updating live editor states
          const newEditorStates = Object.keys(editorStates || {})
            .reduce((res, contentId) => ({
              ...res,
              [contentId]: changedContentStates[contentId] ?
                EditorState.push(
                  editorStates[contentId],
                  convertFromRaw(changedContentStates[contentId]),
                  'remove-entity'
                )
                 :
                editorStates[contentId]
            }), {});
          updateDraftEditorsStates(newEditorStates);
        }
        // resource is cited in other sections
        else {
          newSection = {
            ...thatSection,
            contents: relatedContextualizationsIds.reduce((temp, contId) => {
              const {changed, result} = removeContextualizationReferenceFromRawContents(temp, contId);
              if (changed && !sectionChanged) {
                sectionChanged = true;
              }
              return result;
            }, thatSection.contents),
            notes: Object.keys(thatSection.notes).reduce((temp1, noteId) => ({
              ...temp1,
              [noteId]: {
                ...thatSection.notes[noteId],
                contents: relatedContextualizationsIds.reduce((temp, contId) => {
                  const {changed, result} = removeContextualizationReferenceFromRawContents(temp, contId);
                  if (changed && !sectionChanged) {
                    sectionChanged = true;
                  }
                  return result;
                }, thatSection.notes[noteId].contents)
              }
            }), {})
          };
        }
        if (sectionChanged) {
          updateSection({
            sectionId: thatSection.id,
            storyId: story.id,
            userId,
            section: newSection,
          });
        }
      });
    }

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

  const onSetCoverImage = resourceId => {
    setCoverImage({
      storyId,
      resourceId,
      userId
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
  const onDeleteContextualizationFromId = (contextualizationId) => {
    deleteContextualizationFromId({
      editorStates,
      contextualization: story.contextualizations[contextualizationId],
      updateDraftEditorState,
      updateSection: onUpdateSection,
      section
    });
  };

  const onCreateResource = payload => {
    createResource(payload);
    if (embedResourceAfterCreation) {
      // setTimeout(() => {
          embedLastResource();
        // });
    }
  };

  const onSetSectionLevel = ({sectionId: thatSectionId, level}) => {
    setSectionLevel({
      storyId,
      sectionId: thatSectionId,
      level,
      userId
    });
  };

  return (
    <StretchedLayoutContainer isAbsolute isFluid isDirection="horizontal">
      <StretchedLayoutItem className={`aside-edition-container ${asideTabCollapsed ? 'is-collapsed' : ''} is-hidden-mobile`} isFlex={1}>
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
          setSectionLevel={onSetSectionLevel}

          onDeleteResource={onDeleteResource}
          submitMultiResources={submitMultiResources}

          onResourceEditAttempt={onResourceEditAttempt}
          onSetCoverImage={onSetCoverImage}

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
            draggedResourceId={draggedResourceId}
            setShortcutsHelpVisible={setShortcutsHelpVisible}

            newResourceMode={newResourceMode}

            onNewSectionSubmit={onNewSectionSubmit}

            updateSection={onUpdateSection}

            promptAssetEmbed={promptAssetEmbed}
            unpromptAssetEmbed={unpromptAssetEmbed}
            setEditorFocus={setEditorFocus}

            setEditorBlocked={setEditorBlocked}

            setNewResourceMode={setNewResourceMode}

            newResourceType={newResourceType}
            storyIsSaved={storyIsSaved}

            createContextualization={createContextualization}
            createContextualizer={createContextualizer}
            createResource={onCreateResource}
            uploadResource={uploadResource}

            enterBlock={enterBlock}
            leaveBlock={leaveBlock}

            updateDraftEditorState={updateDraftEditorState}
            updateDraftEditorsStates={updateDraftEditorsStates}

            updateContextualizer={updateContextualizer}
            updateResource={updateResource}
            deleteContextualization={deleteContextualization}
            deleteContextualizer={deleteContextualizer}
            deleteContextualizationFromId={onDeleteContextualizationFromId}

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
            isActive={promptedToDeleteSectionId !== undefined}
            deleteType={'section'}
            story={story}
            id={promptedToDeleteSectionId}
            onClose={() => setPromptedToDeleteSectionId(undefined)}
            onDeleteConfirm={onDeleteSectionConfirm} />
        }
      {
          promptedToDeleteResourceId &&
          <ConfirmToDeleteModal
            isActive={promptedToDeleteResourceId !== undefined}
            deleteType={'resource'}
            story={story}
            id={promptedToDeleteResourceId}
            onClose={() => setPromptedToDeleteResourceId(undefined)}
            onDeleteConfirm={onDeleteResourceConfirm} />
        }
      <ModalCard
        isActive={shortcutsHelpVisible}
        headerContent={translate('Shortcuts help')}
        onClose={() => setShortcutsHelpVisible(false)}
        style={{
          maxHeight: '80%'
        }}
        mainContent={<div>
          <p>
            {t('All the shortcuts presented below are also accessible through the editor graphical interface (move cursor/select text)')}
          </p>
          <table className="table">
            <thead>
              <tr>
                <th>{translate('Shortcut')}</th>
                <th>{translate('Where')}</th>
                <th>{translate('Effect')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th><code>cmd+@</code></th>
                <th>{translate('Anywhere')}</th>
                <th>{translate('Open item citation widget')}</th>
              </tr>
              <tr>
                <th><code>cmd+m</code></th>
                <th>{translate('Anywhere')}</th>
                <th>{translate('Add a new note')}</th>
              </tr>
              <tr>
                <th><code>{translate('"#" then space')}</code></th>
                <th>{translate('Begining of a paragraph')}</th>
                <th>{translate('Add a title')}</th>
              </tr>
              <tr>
                <th><code>{translate('">" then space')}</code></th>
                <th>{translate('Begining of a paragraph')}</th>
                <th>{translate('Add a citation block')}</th>
              </tr>
              <tr>
                <th><code>{translate('"*" then content then "*"')}</code></th>
                <th>{translate('Anywhere')}</th>
                <th>{translate('Write italic text')}</th>
              </tr>
              <tr>
                <th><code>{translate('"**" then content then "**"')}</code></th>
                <th>{translate('Anywhere')}</th>
                <th>{translate('Write bold text')}</th>
              </tr>
              <tr>
                <th><code>{translate('"*" then space')}</code></th>
                <th>{translate('Begining of a paragraph')}</th>
                <th>{translate('Begin a list')}</th>
              </tr>
            </tbody>
          </table>
        </div>} />
    </StretchedLayoutContainer>
  );
};

SectionViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default SectionViewLayout;
