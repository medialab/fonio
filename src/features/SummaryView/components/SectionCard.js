import React from 'react';
import PropTypes from 'prop-types';

import {
  Card,
} from 'quinoa-design-library/components/';

import {translateNameSpacer} from '../../../helpers/translateUtils';

const SectionCard = ({
  section,
  goTo,
  lockData,
  onDelete
}, {t}) => {

  const translate = translateNameSpacer(t, 'Components.SectionCard');

  const onAction = action => {
    switch (action) {
      case 'delete':
        onDelete(section.id);
        break;
      case 'edit':
      default:
        goTo(section.id);
        break;

    }
  };
  const computeFirstWords = () => {
    if (section.contents
        && section.contents.blocks
        && section.contents.blocks[0]
        && section.contents.blocks[0].text
    ) {
      return section.contents.blocks[0].text.length > 30 ?
        <i>{`${section.contents.blocks[0].text.substr(0, 30)}...`}</i>
        :
        <i>{section.contents.blocks[0].text}</i>;
    }
    return '';
  };
  return (
    <Card
      title={section.metadata.title}
      subtitle={section.metadata.subtitle}
      lockStatus={lockData ? 'locked' : 'open'}
      statusMessage={lockData ? translate('edited by {n}', {n: lockData.name}) : translate('open for edition')}
      onAction={onAction}
      bodyContent={computeFirstWords()}
      asideActions={[
        {
          label: translate('edit'),
          id: 'edit',
          isColor: 'primary',
          isDisabled: lockData
        }, {
          label: translate('move'),
          isColor: 'info',
          id: 'move'
        },
        {
          label: translate('delete'),
          isColor: 'danger',
          id: 'delete',
          isDisabled: lockData
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
