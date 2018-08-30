import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import {
  abbrevString
} from '../../../helpers/misc';

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
  const MAX_STR_LEN = 80;
  const translate = translateNameSpacer(t, 'Components.StoryCard');
  return (
    <Card
      title={
        <Columns>
          <Column
            data-effect="solid"
            data-for="tooltip"
            data-tip={(story.metadata.title || '').length > MAX_STR_LEN ? story.metadata.title : undefined}
            isSize={8}>
            <Link style={{color: 'inherit'}} to={`story/${story.id}`}>
              {abbrevString(story.metadata.title, MAX_STR_LEN)}
            </Link>
          </Column>
          <Column style={{maxHeight: '30rem', overflowX: 'auto'}} isSize={4}>
            <div style={{display: 'flex', flexFlow: 'row wrap'}}>
              {
            users
            .map((user, index) => (
              <div style={{marginRight: '1rem', marginBottom: '1rem'}} key={index}>
                <Image
                  data-for={`card-author-${user.userId}`}
                  data-tip={translate('edited by {a}', {a: user.name})}
                  isRounded
                  isSize="16x16"
                  src={user.avatar && require(`../../../sharedAssets/avatars/${user.avatar}`)} />
                <ReactTooltip
                  place="right"
                  effect="solid"
                  id={`card-author-${user.userId}`} />
              </div>
            ))
          }
            </div>
          </Column>
        </Columns>
      }
      subtitle={abbrevString(story.metadata.subtitle, MAX_STR_LEN)}
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
          label: translate('read'),
          id: 'read',
        },
        {
          label: <span>{translate('delete')}</span>,
          isColor: 'danger',
          id: 'delete',
          isDisabled: users.length > 0
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
