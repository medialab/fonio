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
  actions: {
    setUserInfoTemp,
    setUserInfoModalOpen,
    setExportModalOpen,
    createUser,
    setUserInfo,
  },
  children,
}, {
  t
}) => {
  const translate = translateNameSpacer(t, 'Features.EditionUiWrapper');

  // const {
  //   id: storyId,
  //   metadata
  // } = editedStory;

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
        isOpen={false}
        isFixed

        locationBreadCrumbs={[
            {
              href: '/',
              content: <a>{CONFIG.sessionName /* eslint no-undef:0 */}</a>
            },
            {
              href: '/',
              content: <a>{(editedStory && editedStory.metadata && editedStory.metadata.title) || translate('Unnamed story')}</a>,
              isActive: true
            },
          ]}

        menuOptions={[
            {
              href: '/',
              isActive: navLocation === 'summary',
              content: <span>{translate('Summary')}</span>,
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
              content: <span>{translate('Library')}</span>
            },
            {
              href: '/',
              isActive: navLocation === 'design',
              content: <span>{translate('Design')}</span>,
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
