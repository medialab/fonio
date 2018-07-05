import React from 'react';
import PropTypes from 'prop-types';

import {arrayMove} from 'react-sortable-hoc';

import {v4 as genId} from 'uuid';

import {
  Button,
  Column,
  Columns,
  Delete,
  Container,
  Content,
  Collapsable,
  Icon,
  Image,
  Help,
  Level,
  LevelItem,
  LevelLeft,
  StatusMarker,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Title,
} from 'quinoa-design-library/components/';


import MetadataForm from '../../../components/MetadataForm';
import NewSectionForm from '../../../components/NewSectionForm';
import ConfirmToDeleteModal from '../../../components/ConfirmToDeleteModal';

import SortableSectionsList from './SortableSectionsList';

import {translateNameSpacer} from '../../../helpers/translateUtils';
import {createDefaultSection} from '../../../helpers/schemaUtils';
import {
  getReverseSectionsLockMap,
  getStoryActiveAuthors,
  checkIfUserHasLockOnMetadata,
} from '../../../helpers/lockUtils';

const SummaryViewLayout = ({
  editedStory: story,
  lockingMap = {},
  activeUsers,
  userId,
  newSectionOpen,
  promptedToDeleteSectionId,

  actions: {
    enterBlock,
    leaveBlock,
    updateStoryMetadata,
    setNewSectionOpen,
    setPromptedToDeleteSectionId,

    createSection,
    deleteSection,
    updateSectionsOrder,
  },
  goToSection
}, {t}) => {


  const translate = translateNameSpacer(t, 'Features.SummaryView');

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

  const sectionsList = sectionsOrder.filter(sectionId => sections[sectionId]).map(sectionId => sections[sectionId]);
  const reverseSectionLockMap = getReverseSectionsLockMap(lockingMap, activeUsers, storyId);
  const metadataOpen = checkIfUserHasLockOnMetadata(lockingMap, userId, storyId);
  const activeAuthors = getStoryActiveAuthors(lockingMap, activeUsers, storyId);

  const buildAuthorMessage = author => {
    const {name, locks = {}} = author;
    const lockNames = Object.keys(locks).filter(thatName => locks[thatName]);
    let message;
    if (lockNames.length === 1 && lockNames[0] === 'summary') {
      message = translate('{a} is here on the summary', {a: name});
    }
    else if (lockNames.length > 1) {
      const oLockNames = lockNames.filter(n => n !== 'summary');
      if (oLockNames.length === 1) {
        const lockName = oLockNames[0];
        if (lockName === 'sections') {
          const lock = locks[lockName];
          if (lock) {
            const sectionId = locks[lockName].blockId;
            const section = sections[sectionId];
            const sectionTitle = section.metadata.title;
            message = translate('{a} is working on section "{t}"', {a: name, t: sectionTitle});
          }
          else message = translate('{a} is working on a section', {a: name});
        }
        else if (lockName === 'storyMetadata') {
          message = translate('{a} is editing story settings', {a: name});
        }
        else message = translate('{a} is working on {l}', {a: name, l: oLockNames[0]});
      }
      else {
        message = translate('{a} is working on {l} and {n}', {a: name, l: lockNames[0], n: lockNames[1]});
      }
    }
    else {
      message = translate('{a} is nowhere, alone in the dark', {a: name});
    }
    return message;
  };

  const userLockedOnMetadataId = lockingMap[storyId] && lockingMap[storyId].locks &&
    Object.keys(lockingMap[storyId].locks)
      .find(thatUserId => lockingMap[storyId].locks[thatUserId].storyMetadata !== undefined);

  let metadataLockStatus;
  let metadataLockMessage;
  if (userLockedOnMetadataId) {
    if (userLockedOnMetadataId === userId) {
      metadataLockStatus = 'active';
      metadataLockMessage = translate('edited by you');
    }
    else {
      metadataLockStatus = 'locked';
      metadataLockMessage = translate('edited by {a}', {a: activeUsers[userLockedOnMetadataId].name});
    }
  }
   else {
    metadataLockStatus = 'open';
    metadataLockMessage = translate('open to edition');
  }


  const toggleMetadataEdition = () => {
    if (metadataOpen) {
      // leave metadata edition
      leaveBlock({
        storyId,
        userId,
        blockId: 'storyMetadata',
        blockType: 'storyMetadata',
      });
    }
    else {
      // enter metadata edition
      enterBlock({
        storyId,
        userId,
        blockId: 'storyMetadata',
        blockType: 'storyMetadata',
      });
    }
  };

  const onMetadataSubmit = ({payload: {metadata}}) => {
    const payload = {
      storyId,
      userId,
      metadata,
    };
    updateStoryMetadata(payload);
    toggleMetadataEdition();
  };

  const defaultSection = createDefaultSection();
  const defaultSectionMetadata = defaultSection.metadata;

  const onNewSectionSubmit = (metadata) => {
    const newSection = {
      ...defaultSection,
      metadata,
      id: genId()
    };

    createSection({
      sectionId: newSection.id,
      section: newSection,
      storyId,
      userId,
    });
    setNewSectionOpen(false);
    goToSection(newSection.id);
  };

  const onDeleteSection = thatSectionId => {
    setPromptedToDeleteSectionId(thatSectionId);
  };

  const actuallyDeleteSection = thatSectionId => {
    // make sure that section is not edited by another user to prevent bugs and inconsistencies
    // (in UI delete button should be disabled when section is edited, this is a supplementary safety check)
    deleteSection({
      sectionId: thatSectionId,
      storyId,
      userId,
      blockId: thatSectionId,
      blockType: 'sections'
    });
  };

  const onDeleteSectionConfirm = () => {
    actuallyDeleteSection(promptedToDeleteSectionId);
    setPromptedToDeleteSectionId(undefined);
  };

  const onSortEnd = ({oldIndex, newIndex}) => {
    const sectionsIds = sectionsList.map(section => section.id);
    const newSectionsOrder = arrayMove(sectionsIds, oldIndex, newIndex);
    updateSectionsOrder({
      storyId,
      userId,
      sectionsOrder: newSectionsOrder
    });
    // setTempSectionsOrder(newSectionsOrder);
    // // get lock on sections order
    // enterBlock({
    //   storyId,
    //   userId,
    //   blockType: 'sectionsOrder',
    // });
  };

  return (
    <Container style={{position: 'relative', height: '100%'}}>
      <StretchedLayoutContainer isFluid isDirection="horizontal" isAbsolute>
        <StretchedLayoutItem isFluid isFlex={1} isFlowing>
          <Column>

            <Level>
              <Collapsable isCollapsed={metadataOpen}>
                <Title isSize={2}>
                  {title}
                </Title>
                {subtitle && <Title isSize={5}>
                  <i>{subtitle}</i>
                  </Title>}
                {
                    authors.map((author, index) => (
                      <Level key={index}>
                        <LevelLeft>
                          <LevelItem>
                            <Icon isSize="small" isAlign="left">
                              <span className="fa fa-user" aria-hidden="true" />
                            </Icon>
                          </LevelItem>
                          <LevelItem>
                            {author}
                          </LevelItem>
                        </LevelLeft>
                      </Level>
                    ))
                  }
                <Content>
                  <i>{abstract}</i>
                </Content>
              </Collapsable>
            </Level>

            <Level isFullWidth>
              <Button
                isFullWidth
                isColor={metadataOpen ? 'primary' : 'info'}
                disabled={metadataLockStatus === 'locked'}
                onClick={toggleMetadataEdition}>

                {metadataOpen ?
                  <StretchedLayoutContainer isAbsolute style={{alignItems: 'center', justifyContent: 'center'}} isDirection="horizontal">
                    <StretchedLayoutItem>
                      <StatusMarker
                        lockStatus={metadataLockStatus}
                        statusMessage={metadataLockMessage} />
                    </StretchedLayoutItem>
                    <StretchedLayoutItem>{translate('Close story settings')}</StretchedLayoutItem>
                    <StretchedLayoutItem><Delete onClick={toggleMetadataEdition} /></StretchedLayoutItem>
                  </StretchedLayoutContainer>
                  : <StretchedLayoutContainer isAbsolute style={{alignItems: 'center', justifyContent: 'center'}} isDirection="horizontal">
                    <StretchedLayoutItem>
                      <StatusMarker
                        lockStatus={metadataLockStatus}
                        statusMessage={metadataLockMessage} />
                    </StretchedLayoutItem>
                    <StretchedLayoutItem>
                      {translate('Edit story settings')}
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                }
              </Button>
            </Level>
            <Collapsable isCollapsed={!metadataOpen}>
              {metadataOpen && <MetadataForm
                story={story}
                onSubmit={onMetadataSubmit}
                onCancel={toggleMetadataEdition} />}
            </Collapsable>
            <Level />
            <Level />
            <Level />
            {
              activeAuthors.length > 1 &&
                <Title isSize={4}>
                  {translate('What are other authors doing ?')}
                </Title>
            }
            {
                  activeAuthors
                  .filter(a => a.userId !== userId)
                  .map((author, authorIndex) => {
                    return (
                      <Level key={authorIndex}>
                        <LevelLeft>
                          <LevelItem>
                            <Image isRounded isSize="32x32" src={require(`../../../sharedAssets/avatars/${author.avatar}`)} />
                          </LevelItem>
                          <LevelItem>
                            <Help>
                              {buildAuthorMessage(author)}
                            </Help>
                          </LevelItem>
                        </LevelLeft>
                      </Level>
                    );
                  })
                }
          </Column>
        </StretchedLayoutItem>
        {
          newSectionOpen ?
            <StretchedLayoutItem isFluid isFlex={2}isFlowing>
              <Column isWrapper>
                <Column isWrapper>
                  <StretchedLayoutContainer isAbsolute isDirection="vertical">
                    <StretchedLayoutItem>
                      <Title isSize={2}>
                        <Columns>
                          <Column isSize={11}>
                            {translate('New section')}
                          </Column>
                          <Column>
                            <Delete onClick={() => setNewSectionOpen(false)} />
                          </Column>
                        </Columns>
                      </Title>
                    </StretchedLayoutItem>
                    <StretchedLayoutItem isFlex={1}>
                      <NewSectionForm
                        metadata={{...defaultSectionMetadata}}
                        onSubmit={onNewSectionSubmit}
                        onCancel={() => setNewSectionOpen(false)} />
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Column>
              </Column>
            </StretchedLayoutItem>
            :
            <StretchedLayoutItem isFluid isFlex={2} isFlowing>
              <Column>
                <Column>
                  <Title isSize={2}>
                    {translate('Summary')}
                  </Title>
                </Column>
                <Level>
                  <Column>
                    <Button onClick={() => setNewSectionOpen(true)} isFullWidth isColor="primary">
                      {translate('New section')}
                    </Button>
                  </Column>
                </Level>
                <SortableSectionsList
                  items={sectionsList}
                  onSortEnd={onSortEnd}
                  goToSection={goToSection}
                  onDelete={onDeleteSection}
                  useDragHandle
                  reverseSectionLockMap={reverseSectionLockMap} />
              </Column>
            </StretchedLayoutItem>
        }

        <ConfirmToDeleteModal
          isActive={promptedToDeleteSectionId}
          isDisabled={reverseSectionLockMap[promptedToDeleteSectionId]}
          deleteType={'section'}
          story={story}
          id={promptedToDeleteSectionId}
          onClose={() => setPromptedToDeleteSectionId(undefined)}
          onDeleteConfirm={onDeleteSectionConfirm} />
      </StretchedLayoutContainer>
    </Container>
    );
};

SummaryViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default SummaryViewLayout;
