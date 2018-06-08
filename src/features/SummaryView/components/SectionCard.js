import React from 'react';
import PropTypes from 'prop-types';

import {
  Card,
} from 'quinoa-design-library/components/';

import {translateNameSpacer} from '../../../helpers/translateUtils';

const SectionCard = ({
  section,
  goTo,
  lockData
}, {t}) => {

  const translate = translateNameSpacer(t, 'Components.SectionCard');

  const onAction = action => {
    switch (action) {
      case 'edit':
      default:
        goTo(section.id);
        break;
    }
  };

  return (
    <Card
      title={section.metadata.title}
      subtitle={section.metadata.subtitle}
      lockStatus={lockData ? 'locked' : 'open'}
      statusMessage={lockData ? translate('edited by {n}', {n: lockData.name}) : translate('open for edition')}
      onAction={onAction}
      asideActions={[
        {
          label: translate('edit'),
          id: 'edit',
          isColor: 'primary'
        }, {
          label: translate('move'),
          isColor: 'info',
          id: 'move'
        },
        {
          label: translate('delete'),
          isColor: 'danger',
          id: 'delete'
        },

        {
          label: translate('duplicate'),
          id: 'duplicate'
        }
      ]} />
  );
};

SectionCard.contextTypes = {
  t: PropTypes.func
};

export default SectionCard;
