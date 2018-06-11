import React from 'react';
import PropTypes from 'prop-types';

import {
  Columns
} from 'quinoa-design-library/components/';


// import {translateNameSpacer} from '../../../helpers/translateUtils';

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
    deleteSection,
  }
}, {
  // t
}) => {
  // const translate = translateNameSpacer(t, 'Features.SectionView');
  const {id: storyId} = story;

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
  .map(sectionId => {
    let lockStatus;
    if (reverseSectionLockMap[sectionId]) {
      if (reverseSectionLockMap[sectionId].userId === userId) {
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


  const onDeleteSection = sectionId => {
    deleteSection({
      sectionId,
      storyId
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

          setResourceSortVisible={setResourceSortVisible}
          setResourceFilterVisible={setResourceFilterVisible}
          setAsideTabMode={setAsideTabMode}
          setAsideTabCollapsed={setAsideTabCollapsed}
          setMainColumnMode={setMainColumnMode}

          onDeleteSection={onDeleteSection} />
        <MainSectionColumn
          mainColumnMode={mainColumnMode}
          setMainColumnMode={setMainColumnMode}
          section={section}
          updateSection={updateSection}
          story={story} />
      </Columns>
    </div>
  );
};

SectionViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default SectionViewLayout;
