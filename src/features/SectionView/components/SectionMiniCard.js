import React from 'react';
import PropTypes from 'prop-types';

import { SortableHandle } from 'react-sortable-hoc';

import config from '../../../config';

import { translateNameSpacer } from '../../../helpers/translateUtils';
import MovePad from '../../../components/MovePad';

import {
  Button,
  Card,
  Column,
  Columns,
  StatusMarker,
  Icon,
} from 'quinoa-design-library/components/';

import {
  abbrevString,
  computeSectionFirstWords,
  silentEvent
} from '../../../helpers/misc';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import { Link } from 'react-router-dom';

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
  const translate = translateNameSpacer( t, 'Features.SectionView' );
  const lockStatusMessage = () => {
    switch ( section.lockStatus ) {
      case 'active':
        return translate( 'edited by you' );
      case 'locked':
        return translate( 'edited by {a}', { a: section.lockData.name } );
      case 'open':
      default:
        return translate( 'open to edition' );
    }
  };

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
      isActive={ section.lockStatus === 'active' }
      bodyContent={
        <div
          style={ { cursor: section.lockStatus === 'active' ? undefined : 'pointer' } }
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
                section.lockStatus !== 'active' &&
                <Link
                  style={ cardStyle }
                  to={ `/story/${storyId}/section/${section.id}` }
                >
                  {sectionTitle}
                </Link>
              }
              {section.lockStatus === 'active' &&
              <b>{sectionTitle}</b>
              }
              <StatusMarker
                style={ { marginLeft: '1rem' } }
                lockStatus={ section.lockStatus }
                statusMessage={ lockStatusMessage() }
              />
            </Column>
          </Columns>
          <Columns>
            <Column
              style={ { paddingTop: 0 } }
              isOffset={ 2 }
              isSize={ 7 }
            >
              {/*<Button
                data-tip={translate('drag to change section order')}
                data-effect="solid"
                data-place="left"
                data-for="tooltip"
                style={{cursor: 'pointer', pointerEvents: 'none'}}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.move.black.svg} />
                </Icon>
              </Button>*/}
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
                        <Icon icon={ 'arrows-alt' } />
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
