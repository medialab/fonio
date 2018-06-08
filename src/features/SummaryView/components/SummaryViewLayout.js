import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Column,
  Columns,
  Container,
  Content,
  Control,
  Field,
  Delete,
  Collapsable,
  Icon,
  Input,
  Image,
  Help,
  Level,
  Label,
  HelpPin,
  TextArea,
  LevelItem,
  LevelLeft,
  StatusMarker,
  Title,
} from 'quinoa-design-library/components/';


import EditionUiWrapper from '../../EditionUiWrapper/components/EditionUiWrapperContainer';

import SectionCard from './SectionCard';

import {translateNameSpacer} from '../../../helpers/translateUtils';

const SummaryViewLayout = ({
  metadataEdited = false,
  editedStory,
  history,
  lockingMap = {},
  activeUsers,
  userId,

}, {t}) => {


  const translate = translateNameSpacer(t, 'Features.SummaryView');

  const {
    // id: storyId,
    metadata: {
      title,
      subtitle,
      authors,
      description
    },
    sections,
    id,
  } = editedStory;

  // console.log('locking map', lockingMap[id].locks);

  const goToSection = sectionId => {
    history.push(`/story/${id}/section/${sectionId}`);
  };

  const sectionsList = Object.keys(sections).map(sectionId => sections[sectionId]);

  const reverseSectionLockMap = lockingMap[id] && lockingMap[id].locks ?
     Object.keys(lockingMap[id].locks)
      .reduce((result, thatUserId) => {
        const userSectionLock = lockingMap[id].locks[thatUserId].sections;
        if (userSectionLock) {
          return {
            ...result,
            [userSectionLock.blockId]: {
              ...activeUsers[userSectionLock.userId]
            }
          };
        }
        return result;
      }, {})
     : {};

  const storyActiveUsersIds = lockingMap[id] && lockingMap[id].locks ?
    Object.keys(lockingMap[id].locks)
    : [];

  const activeAuthors = lockingMap[id] && lockingMap[id].locks ?
    Object.keys(activeUsers)
      .filter(thatUserId => storyActiveUsersIds.indexOf(thatUserId) > -1)
      .map(thatUserId => ({
        ...activeUsers[userId],
        locks: lockingMap[id].locks[thatUserId]
      }))
      : [];

  const buildAuthorMessage = author => {
    const {name, locks = {}} = author;
    const lockNames = Object.keys(locks);
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


  return (
    <EditionUiWrapper>
      <Container>
        <Level />
        <Level />
        <Columns>
          <Column isSize={'1/3'}>
            <Level>
              <Collapsable isCollapsed={metadataEdited}>
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
                  {description}
                </Content>
              </Collapsable>
            </Level>

            <Level isFullWidth>
              <Button isColor={metadataEdited ? 'primary' : 'info'} onClick={() => console.log('toggle edit metadata') /* eslint no-console: 0 */}>
                <StatusMarker
                  lockStatus={metadataEdited ? 'active' : 'open'}
                  statusMessage={metadataEdited ? 'edited by you' : 'open'} />
                {translate('Edit global settings')}
              </Button>
            </Level>
            <Collapsable isCollapsed={!metadataEdited}>
              <form>
                <Field>
                  <Control>
                    <Label>
                          Story title
                      <HelpPin place="right">
                        Explanation about the story title
                      </HelpPin>
                    </Label>
                    <Input type="text" placeholder="My story" />
                  </Control>
                </Field>
                <Field>
                  <Control>
                    <Label>
                          Story subtitle
                      <HelpPin place="right">
                            Explanation about the story subtitle
                      </HelpPin>
                    </Label>
                    <Input type="text" placeholder="A song of ice and fire" />
                  </Control>
                </Field>

                <Field>
                  <Label>
                      Authors
                    <HelpPin place="right">
                          Explanation about the story authors
                    </HelpPin>
                  </Label>
                  <Control hasIcons>
                    <Input isColor="success" placeholder="Text Input" value="Fania" />
                    <Icon isSize="small" isAlign="left">
                      <span className="fa fa-user" aria-hidden="true" />
                    </Icon>
                    <Icon isSize="small" isAlign="right">
                      <Delete />
                    </Icon>
                  </Control>
                  <Control hasIcons>
                    <Input isColor="success" placeholder="Text Input" value="Fred" />
                    <Icon isSize="small" isAlign="left">
                      <span className="fa fa-user" aria-hidden="true" />
                    </Icon>
                    <Icon isSize="small" isAlign="right">
                      <Delete />
                    </Icon>
                  </Control>
                  <Control hasIcons>
                    <Input isColor="success" placeholder="Text Input" value="Felipe" />
                    <Icon isSize="small" isAlign="left">
                      <span className="fa fa-user" aria-hidden="true" />
                    </Icon>
                    <Icon isSize="small" isAlign="right">
                      <Delete />
                    </Icon>
                  </Control>
                  <Level />
                  <Button isFullWidth>
                      Add an author
                  </Button>
                </Field>
                <Field>
                  <Label>Abstract</Label>
                  <Control hasIcons>
                    <TextArea placeholder={'The abstract'} />
                  </Control>
                </Field>
              </form>
            </Collapsable>
            <Level />
            <Level />
            <Level />
            <Title isSize={4}>
              {translate('What are other authors doing ?')}
            </Title>
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
          <Column isSize={'2/3'}>
            <Title isSize={2}>
              {translate('Summary')}
            </Title>
            <Column>
              <Level>
                <LevelLeft>
                  <LevelItem>
                    <Field hasAddons>
                      <Control>
                        <Input placeholder={translate('find a section')} />
                      </Control>
                      <Control>
                        <Button>{translate('search')}</Button>
                      </Control>
                    </Field>
                  </LevelItem>
                </LevelLeft>
              </Level>
            </Column>
            <Level>
              <Column>
                <Button isFullWidth isColor="primary">
                  {translate('New section')}
                </Button>
              </Column>
            </Level>
            {
              sectionsList.map((section, index) => (
                <Level key={index}>
                  <Column>
                    <SectionCard
                      section={section}
                      goTo={goToSection}
                      lockData={reverseSectionLockMap[section.id]} />
                  </Column>
                </Level>
              ))
            }
          </Column>
        </Columns>


      </Container>
    </EditionUiWrapper>
    );
};

SummaryViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default SummaryViewLayout;
