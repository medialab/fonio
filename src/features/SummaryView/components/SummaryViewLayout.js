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
  activeAuthors = [],
  metadataEdited = false,
  editedStory,
}, {t}) => {

  const translate = translateNameSpacer(t, 'Features.SummaryView');

  console.log('edited story', editedStory);
  const {
    // id: storyId,
    metadata: {
      title,
      subtitle,
      authors,
      description
    },
    sections,
  } = editedStory;

  const sectionsList = Object.keys(sections).map(sectionId => sections[sectionId]);
  console.log('sections list', sectionsList);

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
              {translate('Who is on what ?')}
            </Title>
            {
                  activeAuthors.map((author, authorIndex) => (
                    <Level key={authorIndex}>
                      <LevelLeft>
                        <LevelItem>
                          <Image isRounded isSize="32x32" src="https://via.placeholder.com/48x48" />
                        </LevelItem>
                        <LevelItem>
                          <Help>{author.message}</Help>
                        </LevelItem>
                      </LevelLeft>
                    </Level>
                  ))
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
                      section={section} />
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
