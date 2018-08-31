import React from 'react';
import PropTypes from 'prop-types';

import {arrayMove} from 'react-sortable-hoc';

import {v4 as genId} from 'uuid';

import {
  Button,
  Column,
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
import {abbrevString} from '../../../helpers/misc';

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
      const hasSection = lockNames.find(n => n === 'sections') !== undefined;
      if (oLockNames.length === 1 || hasSection) {
        const lockName = oLockNames[0];
        if (hasSection) {
          const lock = locks[lockName];
          if (lock) {
            const sectionId = locks.sections.blockId;
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
  if (userLockedOnMetadataId && activeUsers[userLockedOnMetadataId]) {
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
    setIsSorting(false);
  };

  const onSetSectionLevel = ({sectionId, level}) => {
    setSectionLevel({
      storyId,
      sectionId,
      level,
      userId
    });
  };

  return (
    <Container style={{position: 'relative', height: '100%'}}>
      <StretchedLayoutContainer isFluid isDirection="horizontal" isAbsolute>
        <StretchedLayoutItem style={{marginTop: '1rem'}} isFluid isFlex={1} isFlowing>
          <Column>
            <Level>
              <Collapsable maxHeight={'100%'} isCollapsed={metadataOpen}>
                <Title isSize={3}>
                  {abbrevString(title, 60)}
                </Title>
                {subtitle && <Title isSize={5}>
                  <i>{abbrevString(subtitle, 60)}</i>
                  </Title>}
                  <div  style={{maxHeight: '15rem', overflow: 'auto'}}>
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
                              {abbrevString(author, 60)}
                            </LevelItem>
                          </LevelLeft>
                        </Level>
                      ))
                    }
                    </div>
                <Content>
                  <i>{abbrevString(abstract, 300)}</i>
                </Content>
              </Collapsable>
            </Level>

            <Level isFullWidth>
              <Button
                isFullWidth
                isColor={metadataOpen ? 'primary' : 'info'}
                disabled={metadataLockStatus === 'locked'}
                onClick={toggleMetadataEdition}>

                {
                  <StretchedLayoutContainer isAbsolute style={{alignItems: 'center', justifyContent: 'space-around', padding: '1rem'}} isDirection="horizontal">
                    <StretchedLayoutItem>
                      <StatusMarker
                        lockStatus={metadataLockStatus}
                        statusMessage={metadataLockMessage} />
                    </StretchedLayoutItem>
                    <StretchedLayoutItem isFlex={1}>
                      {metadataOpen ? translate('Close story settings') : translate('Edit story settings')}
                    </StretchedLayoutItem>
                    {metadataOpen && <StretchedLayoutItem>
                      <Delete isSize="medium" />
                    </StretchedLayoutItem>}
                  </StretchedLayoutContainer>
                }
              </Button>
            </Level>
            <Collapsable isCollapsed={!metadataOpen} maxHeight={'100%'}>
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
                        <StretchedLayoutContainer isDirection={'horizontal'}>
                          <StretchedLayoutItem isFlex={11}>
                            {translate('New section')}
                          </StretchedLayoutItem>
                          <StretchedLayoutItem>
                            <Delete onClick={() => setNewSectionOpen(false)} />
                          </StretchedLayoutItem>
                        </StretchedLayoutContainer>
                      </Title>
                      <Level />
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
                  story={story}
                  onSortEnd={onSortEnd}
                  goToSection={goToSection}
                  onSortStart={() => setIsSorting(true)}
                  isSorting={isSorting}
                  onDelete={onDeleteSection}
                  setSectionLevel={onSetSectionLevel}
                  useDragHandle
                  reverseSectionLockMap={reverseSectionLockMap} />
              </Column>
            </StretchedLayoutItem>
        }

        <ConfirmToDeleteModal
          isActive={promptedToDeleteSectionId !== undefined}
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
