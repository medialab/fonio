import React from 'react';
import PropTypes from 'prop-types';

import {
  Card,
} from 'quinoa-design-library/components/';

import {translateNameSpacer} from '../../../helpers/translateUtils';

const SectionCard = ({
  section
}, {t}) => {

  const translate = translateNameSpacer(t, 'Components.SectionCard');

  return (
    <Card
      title={section.metadata.title}
      subtitle={section.metadata.subtitle}
      lockStatus={'open'}
      statusMessage={'open for edition'}
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
