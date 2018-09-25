import React from 'react';
import PropTypes from 'prop-types';

import {
  Column,
  ModalCard,
  BigSelect,
  Notification,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';
import {translateNameSpacer} from '../../helpers/translateUtils';


const ExportModal = ({
  activeOptionId,
  onClose,
  onChange,
  status,
  isActive
}, {t}) => {

  const translate = translateNameSpacer(t, 'Components.ExportModal');

  return (
    <ModalCard
      isActive={isActive}
      headerContent={translate('Export story')}
      onClose={onClose}
      mainContent={
        <StretchedLayoutContainer isDirection={'vertical'}>
          <StretchedLayoutItem isFlex={1}>
            <Column>
              <BigSelect
                activeOptionId={activeOptionId}
                onChange={onChange}
                boxStyle={{minHeight: '12rem', textAlign: 'center'}}
                options={[
                  {
                    id: 'html',
                    label: translate('Export your story to publish it (HTML format)'),
                    iconUrl: activeOptionId === 'html' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                  },
                  {
                    id: 'json',
                    label: translate('Export your story to backup it (fonio JSON format)'),
                    iconUrl: activeOptionId === 'json' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                  }
                ]} />
            </Column>
          </StretchedLayoutItem>
          {status === 'success' &&
            <StretchedLayoutItem>
              <Notification isColor={'success'}>
                {translate('Story was bundled successfully')}
              </Notification>
            </StretchedLayoutItem>
          }
        </StretchedLayoutContainer>
      } />
  );
};

ExportModal.contextTypes = {
  t: PropTypes.func,
};


export default ExportModal;

