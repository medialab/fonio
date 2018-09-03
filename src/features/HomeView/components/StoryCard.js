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
  Content,
  Icon,
} from 'quinoa-design-library/components/';


const InlineIcon = ({
  icon
}) => <Icon style={{marginRight: '1rem'}} icon={icon} />;

const StoryCard = ({
  story,
  onAction,
  users = [],
  onClick,
}, {
  t
}) => {
  const MAX_STR_LEN = 80;
  const translate = translateNameSpacer(t, 'Components.StoryCard');
  return (
    <div onClick={onClick} style={{cursor: 'pointer'}}>
      <Card
        title={
          <Columns>
            <Column
              data-effect="solid"
              data-for="tooltip"
              data-tip={(story.metadata.title || '').length > MAX_STR_LEN ? story.metadata.title : undefined}
              isSize={8}>
              <Link style={{color: 'inherit'}} to={`story/${story.id}`}>
                <b>{abbrevString(story.metadata.title, MAX_STR_LEN)}</b>
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
        bodyContent={
          <div>
            {
            story.metadata.authors && story.metadata.authors.length > 0 &&
            <Content>
              <i>{abbrevString(story.metadata.authors.join(', '), MAX_STR_LEN)}</i>
            </Content>
          }
            {
            story.metadata.abstract && story.metadata.abstract.length > 0 &&
            <Content>
              {abbrevString(story.metadata.abstract, 300)}
            </Content>
          }
          </div>
        }
        statusMessage={story.edited ? `Edited by ${story.metadata.subtitle}` : undefined}
        onAction={onAction}
        footerActions={[
            // {
            //   label: translate('change password'),
            //   id: 'change password'
            // }
          ]}
        asideActions={[
          {
            label: <span><InlineIcon icon="pencil" /> {translate('open')}</span>,
            isColor: 'primary',
            id: 'open',
          },
          {
            label: <span><InlineIcon icon="eye" />{translate('read')}</span>,
            id: 'read',
          },
          {
            label: <span><InlineIcon icon="copy" />{translate('duplicate')}</span>,
            id: 'duplicate',
          },
          {
            label: <span><InlineIcon icon="lock" />{translate('change password')}</span>,
            id: 'change password'
          },
          {
            label: <span><InlineIcon icon="trash" />{translate('delete')}</span>,
            isColor: 'danger',
            id: 'delete',
            isDisabled: users.length > 0
          },

        ]} />
    </div>
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
