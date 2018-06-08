import React from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import {
  Card,
} from 'quinoa-design-library/components/';

const StoryCard = ({
  story,
  onAction
}, {
  t
}) => {
  const translate = translateNameSpacer(t, 'Components.StoryCard');

  return (
    <Card
      title={story.metadata.title}
      subtitle={story.metadata.subtitle}
      lockStatus={story.edited ? 'active' : 'open'}
      statusMessage={story.edited ? `Edited by ${story.metadata.subtitle}` : undefined}
      onAction={onAction}
      footerActions={[
          {
            label: translate('change password'),
            id: 'change password'
          }
        ]}
      asideActions={[
        {
          label: translate('open'),
          isColor: 'primary',
          id: 'open'
        },
        {
          label: translate('duplicate'),
          id: 'duplicate'
        },
        {
          label: 'info',
          id: 'info'
        },
        {
          label: <span>{translate('delete')}</span>,
          isColor: 'danger',
          id: 'delete'
        },
      ]} />
  );
};

StoryCard.propTypes = {
  story: PropTypes.object,
  onAction: PropTypes.func,
};

StoryCard.contextTypes = {
  t: PropTypes.func
};

export default StoryCard;
