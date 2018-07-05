import React from 'react';
import PropTypes from 'prop-types';
import {get} from 'axios';

import {
  Button,
  Navbar,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import LanguageToggler from '../../../components/LanguageToggler';
import IdentificationModal from '../../../components/IdentificationModal';
import ExportModal from '../../../components/ExportModal';

import {translateNameSpacer} from '../../../helpers/translateUtils';
import downloadFile from '../../../helpers/fileDownloader';
import {
  bundleProjectAsJSON,
} from '../../../helpers/projectBundler';
import {
  abbrevString
} from '../../../helpers/misc';

const EditionUiWrapperLayout = ({
  userId,
  userInfo,
  activeUsers,
  userInfoTemp,
  userInfoModalOpen,
  exportModalOpen,
  editedStory = {},
  lockingMap,
  sectionId,
  navLocation,
  navbarOpen,
  actions: {
    setUserInfoTemp,
    setUserInfoModalOpen,
    setExportModalOpen,
    createUser,
    setUserInfo,
    toggleNavbarOpen,
  },
  children,
  activeSectionTitle,
}, {
  t
}) => {
  const translate = translateNameSpacer(t, 'Features.EditionUiWrapper');

  const storyId = editedStory.id;

  const lockMap = lockingMap[storyId].locks;
  const userLockedOnDesignId = Object.keys(lockMap).find(thatUserId => lockMap[thatUserId].design);
  let designStatus;
  let designMessage;
  if (userLockedOnDesignId === userId) {
    designStatus = 'active';
    designMessage = translate('edited by you');
  }
  else if (userLockedOnDesignId) {
    const userLockedOnDesignInfo = activeUsers[userLockedOnDesignId];
    designStatus = 'locked';
    designMessage = translate('edited by {n}', {n: userLockedOnDesignInfo.name});
  }
  else {
    designStatus = 'open';
    designMessage = translate('open to edition');
  }

  const onSubmitUserInfo = () => {
    createUser({
      ...userInfoTemp,
      userId
    });
    setUserInfo(userInfoTemp);
    setUserInfoModalOpen(false);
  };
  const computeTitle = () => {
    if (editedStory && editedStory.metadata && editedStory.metadata.title) {
      return abbrevString(editedStory.metadata.title);
    }
    else return translate('Unnamed story');
  };
  const exportToFile = (type) => {
    const title = editedStory.metadata.title;
    switch (type) {
      case 'json':
        get(`${CONFIG.apiUrl}/stories/${storyId}?edit=false&&format=json`)
        .then(({data}) => {
          if (data) {
            const JSONbundle = bundleProjectAsJSON(data);
            downloadFile(JSONbundle, 'json', title);
            setExportModalOpen(false);
          }
          // TODO: handle failure error
        });
        break;
      case 'html':
        get(`${CONFIG.apiUrl}/stories/${storyId}?edit=false&&format=html`)
        .then(({data}) => {
          if (data) {
            downloadFile(data, 'html', title);
            setExportModalOpen(false);
          }
          // TODO: handle failure error
        });
        break;
      default:
        break;
    }
  };
  return (
    <StretchedLayoutContainer isAbsolute>
      <Navbar
        brandImage={icons.fonioBrand.svg}
        brandUrl={'/'}
        isOpen={navbarOpen === true}
        onToggle={toggleNavbarOpen}

        locationBreadCrumbs={[
            // {
            //   href: '/',
            //   content: CONFIG.sessionName /* eslint no-undef:0 */,
            // },
            {
              href: `/story/${storyId}`,
              content: computeTitle()
              || translate('Unnamed story'),
              isActive: navLocation === 'summary'
            },
          ]}

        menuOptions={[
            {
              href: `/story/${storyId}`,
              isActive: navLocation === 'summary',
              content: `${translate('Summary')}`,
              // subItems: [
              //   {
              //     href: '/',
              //     content: 'Section 1'
              //   },
              //   {
              //     href: '/',
              //     content: 'Section 2'
              //   },
              //   {
              //     href: '/',
              //     content: 'Section 3'
              //   },
              //   {
              //     href: '/',
              //     content: 'Section 4'
              //   }
              // ]
            },
            navLocation === 'editor' ?
            {
              isActive: true,
              content: `/ ${activeSectionTitle.length > 10 ? activeSectionTitle.substr(0, 10) + '...' : activeSectionTitle}`,
              href: `/story/${storyId}/section/${sectionId}`,
            }
            : undefined,
            {
              href: `/story/${storyId}/library`,
              isActive: navLocation === 'library',
              content: translate('Library'),
            },
            {
              href: `/story/${storyId}/design`,
              isActive: navLocation === 'design',
              content: translate('Design'),
              lockStatus: designStatus,
              statusMessage: designMessage

              // lockStatus: 'locked',
              // statusMessage: 'Edited by fred'
            }
          ].filter(d => d)}
        actionOptions={[{
            content: <Button onClick={() => setExportModalOpen(true)} className="button">{translate('Export')}</Button>
          },
          {
            content: <LanguageToggler />
          }
          ]}
        onProfileClick={() => setUserInfoModalOpen(true)}
        profile={{
            imageUri: userInfo && require(`../../../sharedAssets/avatars/${userInfo.avatar}`),
            nickName: userInfo && userInfo.name
          }} />
      <StretchedLayoutItem isFlex={1} isFlowing>
        {children}
      </StretchedLayoutItem>
      <IdentificationModal
        isActive={userInfoModalOpen}

        userInfo={userInfoTemp}

        onChange={setUserInfoTemp}
        onClose={() => setUserInfoModalOpen(false)}
        onSubmit={onSubmitUserInfo} />
      <ExportModal
        isActive={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onChange={exportToFile} />
    </StretchedLayoutContainer>
  );
};

EditionUiWrapperLayout.contextTypes = {
  t: PropTypes.func,
};

export default EditionUiWrapperLayout;
