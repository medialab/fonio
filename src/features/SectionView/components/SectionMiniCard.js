/**
 * This module provides a card for representing a section in the section edition view
 * @module fonio/features/SectionView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { SortableHandle } from 'react-sortable-hoc';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  Column,
  Columns,
  StatusMarker,
  Icon,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons/faArrowsAlt';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  abbrevString,
  computeSectionFirstWords,
  silentEvent
} from '../../../helpers/misc';

/**
 * Imports Components
 */
import MovePad from '../../../components/MovePad';

/**
 * Imports Assets
 */
import config from '../../../config';

const SectionMiniCard = ( {
  section,
  storyId,
  onDeleteSection,
  onOpenSettings,
  setSectionLevel,

  setSectionIndex,
  sectionIndex,
  maxSectionIndex,
  onSelect,
}, { t } ) => {

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.SectionView' );

  /**
   * Computed variables
   */
  /*
   * let lockStatusMessage;
   * switch ( section.lockStatus ) {
   *   case 'active':
   *     lockStatusMessage = translate( 'edited by you' );
   *     break;
   *   case 'locked':
   *     lockStatusMessage = translate( 'edited by {a}', { a: section.lockData.name } );
   *     break;
   *   case 'open':
   *   default:
   *     lockStatusMessage = translate( 'open to edition' );
   *     break;
   * }
   */
  const isActive = section.lockStatus === 'active';
  let lockStatus;
  let lockStatusMessage;
  const lockData = section.lockData;
  if ( lockData ) {
    lockStatus = lockData.status || 'active';
    if ( lockStatus === 'active' && isActive ) {
      lockStatusMessage = translate( 'edited by you' );
      lockStatus = 'active';
    }
    else if ( lockStatus === 'idle' && isActive ) {
      lockStatusMessage = translate( 'edited by you (inactive)', { a: lockData.name } );
      lockStatus = 'idle';
    }
    else if ( lockStatus === 'active' ) {
      lockStatusMessage = translate( 'edited by {a}', { a: lockData.name } );
      lockStatus = 'locked';
    }
    else {
      lockStatusMessage = translate( 'edited by {a} (inactive)', { a: lockData.name } );
    }
  }
  else {
    lockStatus = 'open';
    lockStatusMessage = translate( 'open to edition' );
  }
  const cardStyle = {
    pointerEvents: section.lockStatus === 'locked' ? 'none' : 'all'
  };
  const sectionTitle = (
    <span
      data-for={ 'tooltip' }
      data-place={ 'right' }
      data-html
      data-tip={ `<div class="content"><h5 style="color: white">${section.metadata.title}</h5><p>${computeSectionFirstWords( section )}</p></div>` }
    >
      {abbrevString( section.metadata.title || translate( 'Untitled section' ), 10 )}
    </span>
  );

  return (
    <Card
      isActive={ lockStatus === 'active' || ( isActive && lockStatus === 'idle' ) }
      bodyContent={
        <div
          style={ { cursor: lockStatus === 'active' || ( isActive && lockStatus === 'idle' ) ? undefined : 'pointer' } }
          onClick={ onSelect }
        >
          <Columns style={ { marginBottom: 0 } }>
            <Column isSize={ 2 }>
              <Icon
                isSize={ 'medium' }
                isAlign={ 'left' }
              >
                <img src={ icons.section.black.svg } />
              </Icon>
            </Column>

            <Column
              style={ { paddingBottom: 0 } }
              isSize={ 8 }
            >
              {
                lockStatus !== 'active' &&
                <Link
                  style={ cardStyle }
                  to={ `/story/${storyId}/section/${section.id}` }
                >
                  {sectionTitle}
                </Link>
              }
              {lockStatus === 'active' &&
              <b>{sectionTitle}</b>
              }
              <StatusMarker
                style={ { marginLeft: '1rem' } }
                lockStatus={ lockStatus }
                statusMessage={ lockStatusMessage }
              />
            </Column>
          </Columns>
          <Columns>
            <Column
              style={ { paddingTop: 0 } }
              isOffset={ 2 }
              isSize={ 7 }
            >
              <Button
                onClick={ onOpenSettings }
                isDisabled={ section.lockStatus !== 'active' }
                data-effect={ 'solid' }
                data-place={ 'left' }
                data-for={ 'tooltip' }
                data-tip={ translate( 'section settings' ) }
              >
                <Icon
                  isSize={ 'small' }
                  isAlign={ 'left' }
                >
                  <img src={ icons.settings.black.svg } />
                </Icon>
              </Button>
              <Button
                onClick={ onDeleteSection }
                isDisabled={ section.lockStatus === 'locked' || section.lockStatus === 'active' }
                data-effect={ 'solid' }
                data-place={ 'left' }
                data-for={ 'tooltip' }
                data-tip={ translate( 'delete this section' ) }
              >
                <Icon
                  isSize={ 'small' }
                  isAlign={ 'left' }
                >
                  <img src={ icons.remove.black.svg } />
                </Icon>
              </Button>
            </Column>

            <Column
              style={ { position: 'relative' } }
              isSize={ 2 }
            >
              <MovePad
                style={ {
                    position: 'absolute',
                        top: '-4rem',
                        right: '5rem',
                  } }
                chevronsData={ {
                    left: {
                      tooltip: translate( 'Title level {n}', { n: section.metadata.level } ),
                      isDisabled: section.metadata.level === 0,
                      onClick: ( e ) => {
                        e.stopPropagation();
                        setSectionLevel( { sectionId: section.id, level: section.metadata.level - 1 } );
                      }
                    },
                    right: {
                      tooltip: translate( 'Title level {n}', { n: section.metadata.level + 2 } ),
                      isDisabled: section.metadata.level >= config.maxSectionLevel - 1,
                      onClick: ( e ) => {
                        e.stopPropagation();
                        setSectionLevel( { sectionId: section.id, level: section.metadata.level + 1 } );
                      }
                    },
                    up: {
                      isDisabled: sectionIndex === 0,
                      tooltip: translate( 'Move up in the summary' ),
                      onClick: ( e ) => {
                        e.stopPropagation();
                        setSectionIndex( sectionIndex, sectionIndex - 1 );
                      }
                    },
                    down: {
                      isDisabled: sectionIndex === maxSectionIndex,
                      tooltip: translate( 'Move down in the summary' ),
                      onClick: ( e ) => {
                        e.stopPropagation();
                        setSectionIndex( sectionIndex, sectionIndex + 1 );
                      }
                    }
                  } }
                moveComponentToolTip={ translate( 'Move section in summary' ) }
                MoveComponent={ SortableHandle( () =>
                    (
                      <span
                        onClick={ silentEvent }
                        onMouseUp={ silentEvent }
                        onMouseDown={ silentEvent }
                        style={ { cursor: 'move' } }
                        className={ 'button' }
                      >
                        <FontAwesomeIcon
                          icon={ faArrowsAlt }
                        />
                      </span>
                    )
                  ) }
              />
            </Column>

          </Columns>
        </div>
    }
    />
  );
};

SectionMiniCard.contextTypes = {
  t: PropTypes.func,
};

export default SectionMiniCard;
