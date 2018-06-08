import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Navbar,
  Level,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import LanguageToggler from '../../../components/LanguageToggler';
import IdentificationModal from '../../../components/IdentificationModal';
import ExportModal from '../../../components/ExportModal';

import {translateNameSpacer} from '../../../helpers/translateUtils';


const EditionUiWrapperLayout = ({
  userId,
  userInfo,
  userInfoTemp,
  userInfoModalOpen,
  exportModalOpen,
  editedStory = {},
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
}, {
  t
}) => {
  const translate = translateNameSpacer(t, 'Features.EditionUiWrapper');

  const onSubmitUserInfo = () => {
    createUser({
      ...userInfoTemp,
      userId
    });
    setUserInfo(userInfoTemp);
    setUserInfoModalOpen(false);
  };
  return (
    <div>
      <Navbar
        brandImage={icons.fonioBrand.svg}
        isOpen={navbarOpen === true}
        onToggle={toggleNavbarOpen}
        isFixed

        locationBreadCrumbs={[
            {
              href: '/',
              content: CONFIG.sessionName /* eslint no-undef:0 */,
            },
            {
              href: '/',
              content: (editedStory && editedStory.metadata && editedStory.metadata.title) || translate('Unnamed story'),
              isActive: true
            },
          ]}

        menuOptions={[
            {
              href: '/',
              isActive: navLocation === 'summary',
              content: translate('Summary'),
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
            {
              href: '/',
              isActive: navLocation === 'library',
              content: translate('Library'),
              lockStatus: 'open',
              statusMessage: translate('open to edition')
            },
            {
              href: '/',
              isActive: navLocation === 'design',
              content: translate('Design'),
              lockStatus: 'open',
              statusMessage: translate('open to edition')

              // lockStatus: 'locked',
              // statusMessage: 'Edited by fred'
            }
          ]}
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
      <Level />
      {children}
      <IdentificationModal
        isActive={userInfoModalOpen}

        userInfo={userInfoTemp}

        onChange={setUserInfoTemp}
        onClose={() => setUserInfoModalOpen(false)}
        onSubmit={onSubmitUserInfo} />
      <ExportModal
        isActive={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onChange={() => console.log('on change export mode') /* eslint no-console : 0 */} />
    </div>
  );
};

EditionUiWrapperLayout.contextTypes = {
  t: PropTypes.func,
};

export default EditionUiWrapperLayout;
