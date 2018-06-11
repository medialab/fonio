import React from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import ReactTooltip from 'react-tooltip';


import {
  Card,
  Image,
  Columns,
  Column,
} from 'quinoa-design-library/components/';

const StoryCard = ({
  story,
  onAction,
  users = [],
}, {
  t
}) => {
  const translate = translateNameSpacer(t, 'Components.StoryCard');
  return (
    <Card
      title={
        <Columns>
          <Column>{story.metadata.title}</Column>
          {
            users
            .map((user, index) => (
              <Column key={index}>
                <Image
                  data-for={`card-author-${user.userId}`}
                  data-tip={translate('edited by {a}', {a: user.name})}
                  isRounded
                  isSize="32x32"
                  src={require(`../../../sharedAssets/avatars/${user.avatar}`)} />
                <ReactTooltip
                  place="bottom"
                  effect="solid"
                  id={`card-author-${user.userId}`} />
              </Column>
            ))
          }
        </Columns>
      }
      subtitle={story.metadata.subtitle}
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
          id: 'open',
        },
        {
          label: translate('duplicate'),
          id: 'duplicate',
        },
        {
          label: 'info',
          id: 'info',
        },
        {
          label: <span>{translate('delete')}</span>,
          isColor: 'danger',
          id: 'delete',
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
