import React from 'react';
import PropTypes from 'prop-types';

import {
  ModalCard,
  Column,
  BigSelect,
  Notification
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
        <div>
          <Column>
            <BigSelect
              activeOptionId={activeOptionId}
              onChange={onChange}
              options={[
                {
                  id: 'html',
                  label: translate('Export as an html page'),
                  iconUrl: activeOptionId === 'html' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                },
                {
                  id: 'json',
                  label: translate('Export as a json workfile'),
                  iconUrl: activeOptionId === 'json' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                }
              ]} />
          </Column>
          {status === 'success' && <Column>
            <Notification isColor="success">
              {translate('Story was bundled successfully')}
            </Notification>
          </Column>}
        </div>
      } />
  );
};

ExportModal.contextTypes = {
  t: PropTypes.func,
};


export default ExportModal;

