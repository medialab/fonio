/**
 * This module provides a layout component for displaying the summary view
 * @module fonio/features/SummaryView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import { arrayMove } from 'react-sortable-hoc';
import { v4 as genId } from 'uuid';
import ReactTooltip from 'react-tooltip';
import {
  Button,
  Column,
  Delete,
  Container,
  Content,
  Collapsable,
  Icon,
  Level,
  LevelItem,
  LevelLeft,
  StatusMarker,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Title,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { createDefaultSection } from '../../../helpers/schemaUtils';
import { abbrevString } from '../../../helpers/misc';

import {
  getReverseSectionsLockMap,
  getStoryActiveAuthors,
  checkIfUserHasLockOnMetadata,
} from '../../../helpers/lockUtils';

/**
 * Imports Components
 */
import MetadataForm from '../../../components/MetadataForm';
import NewSectionForm from '../../../components/NewSectionForm';
import ConfirmToDeleteModal from '../../../components/ConfirmToDeleteModal';
import SortableSectionsList from './SortableSectionsList';
import AuthorItem from './AuthorItem';

/**
 * Shared constants
 */
const ABSTRACT_MAX_LENGTH = 300;

const SummaryViewLayout = ( {
  editedStory: story,
  lockingMap = {},
  activeUsers,
  userId,
  newSectionOpen,
  promptedToDeleteSectionId,
  isSorting,

  actions: {
    enterBlock,
    leaveBlock,
    updateStoryMetadata,
    setNewSectionOpen,
    setPromptedToDeleteSectionId,
    setIsSorting,

    createSection,
    deleteSection,
    updateSectionsOrder,
    setSectionLevel,
  },
  goToSection
}, { t } ) => {

  /**
   * Variables definition
   */
  const {
    metadata: {
      title,
      subtitle,
      authors,
      abstract
    },
    sections,
    sectionsOrder,
    id: storyId,
  } = story;

  /**
   * Local functions
   */
  const translate = translateNameSpacer( t, 'Features.SummaryView' );

  /**
   * Computed variables
   */
  const sectionsList = sectionsOrder.filter( ( sectionId ) => sections[sectionId] ).map( ( sectionId ) => sections[sectionId] );
  const reverseSectionLockMap = getReverseSectionsLockMap( lockingMap, activeUsers, storyId );
  const metadataOpen = checkIfUserHasLockOnMetadata( lockingMap, userId, storyId );
  const activeAuthors = getStoryActiveAuthors( lockingMap, activeUsers, storyId );

  const userLockedOnMetadataId = lockingMap[storyId] && lockingMap[storyId].locks &&
    Object.keys( lockingMap[storyId].locks )
      .find( ( thatUserId ) => lockingMap[storyId].locks[thatUserId].storyMetadata !== undefined );

  let metadataLockStatus;
  let metadataLockMessage;
  if ( userLockedOnMetadataId && activeUsers[userLockedOnMetadataId] ) {
    if ( userLockedOnMetadataId === userId ) {
      metadataLockStatus = 'active';
      metadataLockMessage = translate( 'edited by you' );
    }
    else {
      metadataLockStatus = 'locked';
      metadataLockMessage = translate( 'edited by {a}', { a: activeUsers[userLockedOnMetadataId].name } );
    }
  }
   else {
    metadataLockStatus = 'open';
    metadataLockMessage = translate( 'open to edition' );
  }
  const defaultSection = createDefaultSection();
  const defaultSectionMetadata = defaultSection.metadata;

  /**
   * Callbacks handlers
   */
  const handleMetadataEditionToggle = () => {
    if ( metadataOpen ) {
      // leave metadata edition
      leaveBlock( {
        storyId,
        userId,
        blockId: 'storyMetadata',
        blockType: 'storyMetadata',
      } );
    }
    else {
      // enter metadata edition
      enterBlock( {
        storyId,
        userId,
        blockId: 'storyMetadata',
        blockType: 'storyMetadata',
      } );
    }
  };

  const handleMetadataSubmit = ( { payload: { metadata } } ) => {
    const payload = {
      storyId,
      userId,
      metadata,
    };
    updateStoryMetadata( payload );
    handleMetadataEditionToggle();
  };

  const handleNewSectionSubmit = ( metadata ) => {
    const newSection = {
      ...defaultSection,
      metadata,
      id: genId()
    };

    createSection( {
      sectionId: newSection.id,
      section: newSection,
      storyId,
      userId,
      sectionIndex: sectionsList.length - 1
    } );
    setNewSectionOpen( false );
    goToSection( newSection.id );
  };

  const handleDeleteSection = ( thatSectionId ) => {
    setPromptedToDeleteSectionId( thatSectionId );
  };
  const handleDeleteSectionExecution = ( thatSectionId ) => {

    /*
     * make sure that section is not edited by another user to prevent bugs and inconsistencies
     * (in UI delete button should be disabled when section is edited, this is a supplementary safety check)
     */
    deleteSection( {
      sectionId: thatSectionId,
      storyId,
      userId,
      blockId: thatSectionId,
      blockType: 'sections'
    } );
  };

  const handleDeleteSectionConfirm = () => {
    handleDeleteSectionExecution( promptedToDeleteSectionId );
    setPromptedToDeleteSectionId( undefined );
  };

  const handleSortEnd = ( { oldIndex, newIndex } ) => {
    setIsSorting( false );
    const sectionsIds = sectionsList.map( ( section ) => section.id );
    const newSectionsOrder = arrayMove( sectionsIds, oldIndex, newIndex );
    updateSectionsOrder( {
      storyId,
      userId,
      sectionsOrder: newSectionsOrder
    } );
    ReactTooltip.rebuild();
  };

  const handleSectionIndexChange = ( oldIndex, newIndex ) => {
    const sectionsIds = sectionsList.map( ( section ) => section.id );
    const newSectionsOrder = arrayMove( sectionsIds, oldIndex, newIndex );
    updateSectionsOrder( {
      storyId,
      userId,
      sectionsOrder: newSectionsOrder
    } );
    setIsSorting( false );
  };

  const handleSetSectionLevel = ( { sectionId, level } ) => {
    setSectionLevel( {
      storyId,
      sectionId,
      level,
      userId
    } );
  };

  const handleCloseNewSection = () => setNewSectionOpen( false );
  const handleOpenNewSection = () => setNewSectionOpen( true );
  const handleActiveIsSorting = () => setIsSorting( true );

  return (
    <Container style={ { position: 'relative', height: '100%' } }>
      <StretchedLayoutContainer
        isFluid
        isDirection={ 'horizontal' }
        isAbsolute
      >
        <StretchedLayoutItem
          style={ { marginTop: '1rem' } }
          isFluid
          isFlex={ 1 }
          isFlowing
        >
          <Column>
            <Level style={ { marginBottom: '.4rem' } }>
              <Collapsable
                maxHeight={ '100%' }
                isCollapsed={ metadataOpen }
              >
                <Title isSize={ 3 }>
                  {abbrevString( title, 60 )}
                </Title>
                {subtitle &&
                  <Title isSize={ 5 }>
                    <i>{abbrevString( subtitle, 60 )}</i>
                  </Title>
                }
                <div style={ { maxHeight: '15rem', overflow: 'auto' } }>
                  {
                      authors.map( ( author, index ) => (
                        <Level key={ index }>
                          <LevelLeft>
                            <LevelItem>
                              <Icon
                                isSize={ 'small' }
                                isAlign={ 'left' }
                              >
                                <span
                                  className={ 'fa fa-user' }
                                  aria-hidden={ 'true' }
                                />
                              </Icon>
                            </LevelItem>
                            <LevelItem>
                              {abbrevString( author, 60 )}
                            </LevelItem>
                          </LevelLeft>
                        </Level>
                      ) )
                    }
                </div>
                <Content>
                  <i>{abbrevString( abstract, ABSTRACT_MAX_LENGTH )}</i>
                </Content>
              </Collapsable>
            </Level>

            <Level isFullWidth>
              <Button
                isFullWidth
                isColor={ metadataOpen ? 'primary' : 'info' }
                disabled={ metadataLockStatus === 'locked' }
                onClick={ handleMetadataEditionToggle }
              >

                {
                  <StretchedLayoutContainer
                    isAbsolute
                    style={ { alignItems: 'center', justifyContent: 'space-around', padding: '1rem' } }
                    isDirection={ 'horizontal' }
                  >
                    <StretchedLayoutItem>
                      <StatusMarker
                        lockStatus={ metadataLockStatus }
                        statusMessage={ metadataLockMessage }
                      />
                    </StretchedLayoutItem>
                    <StretchedLayoutItem isFlex={ 1 }>
                      {metadataOpen ? translate( 'Close story settings' ) : translate( 'Edit story settings' )}
                    </StretchedLayoutItem>
                    {metadataOpen &&
                      <StretchedLayoutItem>
                        <Delete isSize={ 'medium' } />
                      </StretchedLayoutItem>
                    }
                  </StretchedLayoutContainer>
                }
              </Button>
            </Level>
            <Collapsable
              isCollapsed={ !metadataOpen }
              maxHeight={ '100%' }
            >
              {
                metadataOpen &&
                <div style={ { marginTop: '1rem' } }>
                  <MetadataForm
                    story={ story }
                    onSubmit={ handleMetadataSubmit }
                    onCancel={ handleMetadataEditionToggle }
                  />
                </div>
              }
            </Collapsable>
            <Level />
            <Level />
            <Level />
            {
              activeAuthors.length > 1 &&
                <Title isSize={ 4 }>
                  {translate( 'What are other authors doing ?' )}
                </Title>
            }
            {
                  activeAuthors
                  .filter( ( a ) => a.userId !== userId )
                  .map( ( author, authorIndex ) =>
                    (
                      <AuthorItem
                        author={ author }
                        key={ authorIndex }
                        translate={ translate }
                        sections={ sections }
                      />
                    )
                  )
                }
          </Column>
        </StretchedLayoutItem>
        {
          newSectionOpen ?
            <StretchedLayoutItem
              isFluid
              isFlex={ 2 }
              isFlowing
            >
              <Column isWrapper>
                <Column isWrapper>
                  <StretchedLayoutContainer
                    isAbsolute
                    isDirection={ 'vertical' }
                  >
                    <StretchedLayoutItem>
                      <Title isSize={ 2 }>
                        <StretchedLayoutContainer
                          style={ { paddingTop: '1rem' } }
                          isDirection={ 'horizontal' }
                        >
                          <StretchedLayoutItem isFlex={ 11 }>
                            {translate( 'New section' )}
                          </StretchedLayoutItem>
                          <StretchedLayoutItem>
                            <Delete onClick={ handleCloseNewSection } />
                          </StretchedLayoutItem>
                        </StretchedLayoutContainer>
                      </Title>
                      <Level />
                    </StretchedLayoutItem>
                    <StretchedLayoutItem isFlex={ 1 }>
                      <NewSectionForm
                        metadata={ { ...defaultSectionMetadata } }
                        onSubmit={ handleNewSectionSubmit }
                        onCancel={ handleCloseNewSection }
                      />
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Column>
              </Column>
            </StretchedLayoutItem>
            :
            <StretchedLayoutItem
              isFluid
              isFlex={ 2 }
              isFlowing
            >
              <Column>
                <Column>
                  <Title isSize={ 2 }>
                    {translate( 'Summary' )}
                  </Title>
                </Column>
                <Level>
                  <Column>
                    <Button
                      onClick={ handleOpenNewSection }
                      isFullWidth
                      isColor={ 'primary' }
                    >
                      {translate( 'New section' )}
                    </Button>
                  </Column>
                </Level>
                <SortableSectionsList
                  items={ sectionsList }
                  story={ story }
                  handleSortEnd={ handleSortEnd }
                  goToSection={ goToSection }
                  handleSectionIndexChange={ handleSectionIndexChange }
                  onSortStart={ handleActiveIsSorting }
                  isSorting={ isSorting }
                  onDelete={ handleDeleteSection }
                  setSectionLevel={ handleSetSectionLevel }
                  useDragHandle
                  reverseSectionLockMap={ reverseSectionLockMap }
                />
              </Column>
            </StretchedLayoutItem>
        }

        <ConfirmToDeleteModal
          isActive={ promptedToDeleteSectionId !== undefined }
          isDisabled={ reverseSectionLockMap[promptedToDeleteSectionId] }
          deleteType={ 'section' }
          story={ story }
          id={ promptedToDeleteSectionId }
          onClose={ () => setPromptedToDeleteSectionId( undefined ) }
          onDeleteConfirm={ handleDeleteSectionConfirm }
        />
      </StretchedLayoutContainer>
    </Container>
    );
};

SummaryViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default SummaryViewLayout;
