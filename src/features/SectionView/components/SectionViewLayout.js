import React from 'react';
import PropTypes from 'prop-types';

import {v4 as genId} from 'uuid';

import {arrayMove} from 'react-sortable-hoc';

import {
  Columns
} from 'quinoa-design-library/components/';


// import {translateNameSpacer} from '../../../helpers/translateUtils';
import {createDefaultSection} from '../../../helpers/schemaUtils';

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
  }
}, {
  // t
}) => {
  // const translate = translateNameSpacer(t, 'Features.SectionView');
  const {id: storyId} = story;
  const {id: sectionId} = section;
  const defaultSection = createDefaultSection();


  const reverseSectionLockMap = lockingMap[storyId] && lockingMap[storyId].locks ?
     Object.keys(lockingMap[storyId].locks)
      .reduce((result, thatUserId) => {
        const userSectionLock = lockingMap[storyId].locks[thatUserId].sections;
        if (userSectionLock) {
          return {
            ...result,
            [userSectionLock.blockId]: {
              ...activeUsers[userSectionLock.userId]
            }
          };
        }
        return result;
      }, {})
     : {};

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
      ...story.sections[sectionId],
      lockData: reverseSectionLockMap[sectionId],
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

  const onDeleteSection = thatSectionId => {
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
      </Columns>
    </div>
  );
};

SectionViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default SectionViewLayout;
