/**
 * This module provides a section card for the summary view
 * @module fonio/features/SummaryView
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
  Icon,
  StatusMarker,
  Columns,
  Column,
  Title,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons/faArrowsAlt';

/**
 * Imports Project utils
 */
import { silentEvent } from '../../../helpers/misc';
import { translateNameSpacer } from '../../../helpers/translateUtils';
import {
  abbrevString,
  computeSectionFirstWords
} from '../../../helpers/misc';

/**
 * Imports Components
 */
import MovePad from '../../../components/MovePad';

/**
 * Imports Assets
 */
import config from '../../../config';

/**
 * Shared variables
 */
const MAX_TITLE_LEN = 30;

const SectionCard = ( {
  section,
  goTo,
  lockData,
  setSectionLevel,
  sectionIndex,
  maxSectionIndex,
  // minified,
  story,
  onDelete,
  setSectionIndex,
}, { t } ) => {

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Components.SectionCard' );

  /**
   * Computed variables
   */
  let lockStatusMessage;
  let lockStatus;
  if ( lockData ) {
    if ( lockData && lockData.status === 'idle' ) {
      lockStatusMessage = translate( 'edited by {a} (inactive)', { a: lockData.name } );
      lockStatus = 'idle';
    }
    else {
      lockStatusMessage = translate( 'edited by {a}', { a: lockData.name } );
      lockStatus = 'locked';
    }
  }
  else {
    lockStatusMessage = translate( 'open to edition' );
    lockStatus = 'open';
  }

  const sectionTitle = (
    <span
      data-for={ 'tooltip' }
      data-place={ 'right' }
      data-html
      data-tip={ `<div class="content"><h5 style="color: white">${section.metadata.title}</h5><p>${computeSectionFirstWords( section )}</p></div>` }
    >
      {abbrevString( section.metadata.title || translate( 'Untitled section' ), MAX_TITLE_LEN )}
    </span>
  );

  const titleSize = 5;

  /**
   * Callbacks handlers
   */
  const handleAction = ( action, event ) => {
    event.stopPropagation();
    switch ( action ) {
      case 'delete':
        onDelete( section.id );
        break;
      case 'higher':
        setSectionLevel( { sectionId: section.id, level: section.metadata.level - 1 } );
        break;
      case 'lower':
        setSectionLevel( { sectionId: section.id, level: section.metadata.level + 1 } );
        break;
      case 'edit':
      default:
        goTo( section.id );
        break;

    }
  };

  const handleClick = ( e ) => {
    e.stopPropagation();
    if ( !lockData ) {
      goTo( section.id );
    }
  };
  const handleEdit = ( e ) => handleAction( 'edit', e );
  const handleDelete = ( e ) => handleAction( 'delete', e );

  const editable = !lockData || ( lockData && lockData.status && lockData.status === 'idle' );

  return (
    <div
      className={ 'is-clickable' }
      onClick={ handleClick }
    >
      <Card
        onAction={ handleAction }
        bodyContent={
          <div>
            <Columns style={ { marginBottom: 0 } }>
              <Column
                style={ { paddingBottom: 0 } }
                isSize={ 1 }
              >
                <Icon
                  isSize={ 'medium' }
                >
                  <img src={ icons.section.black.svg } />
                </Icon>
              </Column>

              <Column
                style={ { paddingBottom: 0 } }
                isSize={ 7 }
              >
                {
                    editable &&
                    <Title isSize={ titleSize }>
                      <Link
                        to={ `/story/${story.id}/section/${section.id}` }
                        data-tip={ section.metadata.title.length > MAX_TITLE_LEN ? section.metadata.title : undefined }
                        data-for={ 'tooltip' }
                        data-place={ 'bottom' }
                      >
                        <span>
                          {abbrevString( section.metadata.title || translate( 'Untitled section' ), MAX_TITLE_LEN )}
                        </span>
                      </Link>
                      <StatusMarker
                        lockStatus={ lockStatus }
                        statusMessage={ lockStatusMessage }
                      />
                    </Title>
                  }
                {!editable &&
                <Title isSize={ titleSize }>
                  <span
                    data-tip={ section.metadata.title.length > MAX_TITLE_LEN ? section.metadata.title : undefined }
                    data-for={ 'tooltip' }
                    data-place={ 'bottom' }
                  >
                    {sectionTitle}
                  </span>
                  <StatusMarker
                    lockStatus={ lockData ? 'locked' : 'open' }
                    statusMessage={ lockStatusMessage }
                  />
                </Title>
                  }
              </Column>
            </Columns>
            <Columns>
              <Column
                isOffset={ 1 }
                isSize={ 7 }
              >
                <i style={ { fontSize: '0.7rem' } }>{computeSectionFirstWords( section )}</i>
                <div style={ { marginTop: '1rem' } }>
                  <Button
                    onClick={ handleEdit }
                    isDisabled={ lockData !== undefined }
                    data-effect={ 'solid' }
                    data-place={ 'left' }
                    data-for={ 'tooltip' }
                    data-tip={ lockData === undefined ? translate( 'edit section' ) : undefined }
                  >
                    <Icon
                      isSize={ 'small' }
                      isAlign={ 'left' }
                    >
                      <img src={ icons.edit.black.svg } />
                    </Icon>
                  </Button>
                  <Button
                    onClick={ handleDelete }
                    isDisabled={ lockData !== undefined }
                    data-effect={ 'solid' }
                    data-place={ 'left' }
                    data-for={ 'tooltip' }
                    data-tip={ lockData === undefined ? translate( 'delete this section' ) : undefined }
                  >
                    <Icon
                      isSize={ 'small' }
                      isAlign={ 'left' }
                    >
                      <img src={ icons.remove.black.svg } />
                    </Icon>
                  </Button>
                </div>
              </Column>
              <Column
                style={ { position: 'relative' } }
                isSize={ 2 }
              >
                <MovePad
                  style={ {
                      position: 'absolute',
                      top: '-3rem',
                      right: '1rem'
                    } }
                  chevronsData={ {
                      left: {
                        tooltip: translate( 'Title level {n}', { n: section.metadata.level } ),
                        isDisabled: section.metadata.level === 0,
                        onClick: () => setSectionLevel( { sectionId: section.id, level: section.metadata.level - 1 } )
                      },
                      right: {
                        tooltip: translate( 'Title level {n}', { n: section.metadata.level + 2 } ),
                        isDisabled: section.metadata.level >= config.maxSectionLevel - 1,
                        onClick: () => setSectionLevel( { sectionId: section.id, level: section.metadata.level + 1 } )
                      },
                      up: {
                        isDisabled: sectionIndex === 0,
                        tooltip: translate( 'Move up in the summary' ),
                        onClick: () => setSectionIndex( sectionIndex, sectionIndex - 1 )
                      },
                      down: {
                        isDisabled: sectionIndex === maxSectionIndex,
                        tooltip: translate( 'Move down in the summary' ),
                        onClick: () => setSectionIndex( sectionIndex, sectionIndex + 1 )
                      }
                    } }
                  moveComponentToolTip={ translate( 'Move section in summary' ) }
                  MoveComponent={ SortableHandle( () =>
                      (
                        <span
                          onClick={ silentEvent }
                          onMouseUp={ silentEvent }
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
    </div>
  );
};

SectionCard.contextTypes = {
  t: PropTypes.func
};

export default SectionCard;
