/**
 * This module provides a card for displaying a story
 * @module fonio/features/HomeView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import {
  Card,
  Image,
  Columns,
  Column,
  Content,
  Icon,
} from 'quinoa-design-library/components/';
import './StoryCard.scss';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  abbrevString
} from '../../../helpers/misc';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons/faPencilAlt';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faLock } from '@fortawesome/free-solid-svg-icons/faLock';
import { faCopy } from '@fortawesome/free-solid-svg-icons/faCopy';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';

/**
 * Shared variables
 */
const MAX_STR_LEN = 80;
const ABSTRACT_MAX_LENGTH = 300;

const InlineIcon = ( {
  children
} ) => (
  <span
    className={ 'inline-icon-container' }
  >
    <Icon
      isSize={ 'small' }
    >
      {children}
    </Icon>
  </span>
);

const StoryCard = ( {
  story,
  onAction,
  users = [],
  onClick,
}, {
  t
} ) => {
  const isSpecial = story.metadata.isSpecial;
  const translate = translateNameSpacer( t, 'Components.StoryCard' );
  return (
    <div
      onClick={ onClick }
      className={ `fonio-StoryCard is-clickable ${isSpecial ? 'is-special' : ''}` }
    >
      <Card
        title={
          <Columns>
            <Column
              data-effect={ 'solid' }
              data-for={ 'tooltip' }
              className={ 'story-card__title' }
              data-tip={ ( story.metadata.title || '' ).length > MAX_STR_LEN ? story.metadata.title : undefined }
              isSize={ users.length ? 8 : 12 }
            >
              <Link
                style={ { color: 'inherit' } }
                to={ `story/${story.id}` }
              >
                <b>{abbrevString( story.metadata.title, MAX_STR_LEN )}</b>
              </Link>

            </Column>
            {users.length ?
              <Column
                className={ 'users-container' }
                isSize={ 4 }
              >
                <div className={ 'users-wrapper' }>
                  {
              users
              .map( ( user, index ) => (
                <div
                  className={ 'user-container' }
                  key={ index }
                >
                  <Image
                    data-for={ `card-author-${user.userId}` }
                    data-tip={ translate( 'edited by {a}', { a: user.name } ) }
                    isRounded
                    isSize={ '16x16' }
                    src={ user.avatar && require( `../../../sharedAssets/avatars/${user.avatar}` ) }
                  />
                  <ReactTooltip
                    place={ 'right' }
                    effect={ 'solid' }
                    id={ `card-author-${user.userId}` }
                  />
                </div>
              ) )
            }
                </div>
              </Column>
            : null}
          </Columns>
      }
        subtitle={ abbrevString( story.metadata.subtitle, MAX_STR_LEN ) }
        bodyContent={
          <div>
            <div className={ 'authors-container' }>
              {
                story.metadata.authors && story.metadata.authors.length > 0 &&
                <Content>
                  <i>{abbrevString( story.metadata.authors.join( ', ' ), MAX_STR_LEN )}</i>
                </Content>
              }
              {
                story.metadata.abstract && story.metadata.abstract.length > 0 &&
                <Content>
                  {abbrevString( story.metadata.abstract, ABSTRACT_MAX_LENGTH )}
                </Content>
              }
            </div>
            {
            story.lastUpdateAt &&
            <Content className={ 'last-update-container' }>
              <i>{translate( 'Last update {t}', { t: new Date( story.lastUpdateAt ).toLocaleString() } )}</i>
            </Content>
          }
          </div>
      }
        statusMessage={ story.edited ? `Edited by ${story.metadata.subtitle}` : undefined }
        onAction={ onAction }
        footerActions={ [] }
        asideActions={ isSpecial ? [] : [
          {
            label: <span><InlineIcon><FontAwesomeIcon icon={ faPencilAlt } /></InlineIcon> {translate( 'edit' )}</span>,
            isColor: 'primary',
            id: 'open',
          },
          {
            label: <span><InlineIcon><FontAwesomeIcon icon={ faEye } /></InlineIcon>{translate( 'read' )}</span>,
            id: 'read',
          },
          {
            label: <span><InlineIcon><FontAwesomeIcon icon={ faCopy } /></InlineIcon>{translate( 'duplicate' )}</span>,
            id: 'duplicate',
          },
          {
            label: <span><InlineIcon><FontAwesomeIcon icon={ faLock } /></InlineIcon>{translate( 'change password' )}</span>,
            id: 'change password'
          },
          {
            label: <span><InlineIcon><FontAwesomeIcon icon={ faTrash } /></InlineIcon>{translate( 'delete' )}</span>,
            isColor: 'warning',
            id: 'delete',
            isDisabled: users.length > 0
          },

        ] }
      />
    </div>
  );
};

StoryCard.propTypes = {
  onAction: PropTypes.func,
  story: PropTypes.object,
};

StoryCard.contextTypes = {
  t: PropTypes.func
};

export default StoryCard;
