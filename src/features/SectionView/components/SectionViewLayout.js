import React from 'react';
import PropTypes from 'prop-types';

import {v4 as genId} from 'uuid';

import {arrayMove} from 'react-sortable-hoc';

import {
  Columns,
  Button,
  ModalCard
} from 'quinoa-design-library/components/';


import {translateNameSpacer} from '../../../helpers/translateUtils';
import {createDefaultSection} from '../../../helpers/schemaUtils';
import {
  getReverseSectionsLockMap,
  getStoryActiveAuthors,
} from '../../../helpers/lockUtils';

import AsideSectionColumn from './AsideSectionColumn';
import MainSectionColumn from './MainSectionColumn';


const SectionViewLayout = ({
  asideTabMode,
  asideTabCollapsed,
  mainColumnMode,
  resourceSortVisible,
  resourceFilterVisible,
  lockingMap = {},
  activeUsers,
  userId,
  promptedToDeleteSectionId,

  story,
  section,
  actions: {
    setAsideTabMode,
    setAsideTabCollapsed,
    setMainColumnMode,
    setResourceSortVisible,
    setResourceFilterVisible,
    updateSection,
    enterBlock,
    setTempSectionToCreate,
    setTempSectionIdToDelete,
    setTempSectionsOrder,
    setPromptedToDeleteSectionId,
  }
}, {
  t
}) => {
  const translate = translateNameSpacer(t, 'Features.SectionView');
  const {id: storyId} = story;
  // const {id: sectionId} = section;
  const defaultSection = createDefaultSection();


  const reverseSectionLockMap = getReverseSectionsLockMap(lockingMap, activeUsers, storyId);

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

  const onNewSectionSubmit = (metadata) => {
    const newSection = {
      ...defaultSection,
      metadata,
      id: genId()
    };

    setTempSectionToCreate(newSection);
    // get lock on sections order
    enterBlock({
      storyId,
      userId,
      location: 'sectionsOrder',
    });
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

  const actuallyDeleteSection = thatSectionId => {
    // make sure that section is not edited by another user to prevent bugs and inconsistencies
    // (in UI delete button should be disabled when section is edited, this is a supplementary safety check)
    if (!reverseSectionLockMap[thatSectionId]) {
      // store section to be deleted
      setTempSectionIdToDelete(thatSectionId);
      // get lock on sections order
      enterBlock({
        storyId,
        userId,
        location: 'sectionsOrder',
      });
    }
  };

  const onDeleteSectionConfirm = () => {
    actuallyDeleteSection(promptedToDeleteSectionId);
    setPromptedToDeleteSectionId(undefined);
  };

  const onOpenSectionSettings = () => {
    setMainColumnMode('editmetadata');
  };

  const onSectionsSortEnd = ({oldIndex, newIndex}) => {
    const sectionsIds = sectionsList.map(thatSection => thatSection.id);
    const newSectionsOrder = arrayMove(sectionsIds, oldIndex, newIndex);
    setTempSectionsOrder(newSectionsOrder);
    // get lock on sections order
    enterBlock({
      storyId,
      userId,
      location: 'sectionsOrder',
    });
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

          onOpenSectionSettings={onOpenSectionSettings}
          setResourceSortVisible={setResourceSortVisible}
          setResourceFilterVisible={setResourceFilterVisible}
          setAsideTabMode={setAsideTabMode}
          setAsideTabCollapsed={setAsideTabCollapsed}
          setMainColumnMode={setMainColumnMode}
          onSortEnd={onSectionsSortEnd}

          onDeleteSection={onDeleteSection} />
        <MainSectionColumn
          mainColumnMode={mainColumnMode}
          setMainColumnMode={setMainColumnMode}
          section={section}
          story={story}
          userId={userId}
          defaultSectionMetadata={defaultSection.metadata}

          onNewSectionSubmit={onNewSectionSubmit}

          updateSection={updateSection} />
        {
          promptedToDeleteSectionId &&
          !reverseSectionLockMap[promptedToDeleteSectionId] &&
          <ModalCard
            isActive
            headerContent={translate('Delete a section')}
            mainContent={
              <div>
                {(story && story.sections[promptedToDeleteSectionId]) ? translate(
                    'Are you sure you want to delete the section "{s}" ? All its content will be lost without possible recovery.',
                    {
                      s: story.sections[promptedToDeleteSectionId].metadata.title
                    }
                  ) : translate('Are you sure you want to delete this section ?')}
              </div>
            }
            footerContent={[
              <Button
                type="submit"
                isFullWidth
                key={0}
                onClick={onDeleteSectionConfirm}
                isColor="success">{translate('Delete the section')}</Button>,
              <Button
                onClick={() => setPromptedToDeleteSectionId(undefined)} isFullWidth key={1}
                isColor="warning">{translate('Cancel')}</Button>,
            ]} />
        }
      </Columns>
    </div>
  );
};

SectionViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default SectionViewLayout;
