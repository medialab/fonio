/* eslint react/jsx-no-bind:0 */

/**
 * This module exports a stateless component rendering the layout of the editor feature interface
 * @module fonio/features/HomeView
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Card,
  Column,
  Columns,
  Container,
  Content,
  Control,
  DropZone,
  Field,
  Footer,
  Hero,
  HeroBody,
  HeroFooter,
  HeroHeader,
  HelpPin,
  Icon,
  Image,
  Label,
  Input,
  Level,
  LevelItem,
  LevelLeft,
  LevelRight,
  Navbar,
  Tab,
  Delete,
  TabLink,
  TabList,
  TextArea,
  Tabs,
  Help,
  Title,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import LanguageToggler from '../../../components/LanguageToggler';

import {translateNameSpacer} from '../../../helpers/translateUtils';


/**
 * Renders the component
 * @return {ReactElement} markup
 */

class HomeViewLayout extends Component {
  constructor(props, context) {
    super(props);


    this.translate = translateNameSpacer(context.t, 'Features.HomeView');
  }

  renderContent = mode => {
    switch (mode) {
      case 'learn':
        return (
          <Container>
            <Column>
              <Content>
                <h1>{this.translate('Learn fonio')}</h1>
                <p>
                  {this.translate('learn fonio detail')}
                </p>
              </Content>
            </Column>
          </Container>
        );
      case 'about':
        return (
          <Container>
            <Column>
              <Content>
                <h1>{this.translate('About fonio')}</h1>
                <p>
                  {this.translate('about fonio details')}
                </p>
              </Content>
            </Column>
          </Container>
        );
      case 'stories':
      default:
        const {
          stories,
          newStoryOpen,
          storyInfoVisible,
          newStoryTabMode,

          actions: {
            setNewStoryTabMode,
            setNewStoryOpen,
          }
        } = this.props;

        const storiesList = Object.keys(stories).map(id => stories[id]);
        return (
          <Container>
            <Columns>
              <Column isHidden={storyInfoVisible} isSize={storyInfoVisible ? 0 : '1/3'}>
                <Title isSize={2}>
                  {'Scube 2018'}
                </Title>

                <div>
                  <Title isSize={5}>
                    {this.translate('Your profile')} <HelpPin>{this.translate('choose how you will be identified by other writers')}</HelpPin>
                  </Title>
                  <Level isMobile>
                    <LevelLeft>
                      <LevelItem>
                        <Image isRounded isSize="64x64" src="https://via.placeholder.com/48x48" />
                      </LevelItem>
                      <LevelItem>
                       Anonymous
                      </LevelItem>
                      <LevelItem>
                        <Button>
                          {this.translate('edit')}
                        </Button>
                      </LevelItem>
                    </LevelLeft>
                  </Level>
                </div>
                <Level />
                <Content>
                  {this.translate('intro short title')}
                </Content>

                <div>
                  <Button isFullWidth onClick={() => setNewStoryOpen(!newStoryOpen)} isColor={newStoryOpen ? 'primary' : 'info'}>
                    {this.translate('New story')}
                  </Button>
                </div>
                <Level />
              </Column>
              <Column isHidden={newStoryOpen} isSize={storyInfoVisible ? '1/2' : '2/3'}>
                <Column>
                  <Level isDisplay={storyInfoVisible ? 'block' : 'flex'}>
                    <LevelLeft>
                      <Field hasAddons>
                        <Control>
                          <Input placeholder={this.translate('find a story')} />
                        </Control>
                        <Control>
                          <Button>{this.translate('search')}</Button>
                        </Control>
                      </Field>
                    </LevelLeft>
                    <LevelRight>
                      <LevelItem><i>{this.translate('sort by:')}</i></LevelItem>
                      <LevelItem><strong>{this.translate('last modification date')}</strong></LevelItem>
                      <LevelItem><a>{this.translate('creation date')}</a></LevelItem>
                      <LevelItem><a>{this.translate('title')}</a></LevelItem>
                    </LevelRight>
                  </Level>
                </Column>
                {
                        storiesList.map((story, index) => (
                          <Level key={index}>
                            <Column>
                              <Card
                                key={index}
                                title={story.title}
                                subtitle={story.subtitle}
                                lockStatus={story.edited ? 'active' : 'open'}
                                statusMessage={story.edited ? `Edited by ${story.subtitle}` : undefined}
                                onAction={(id) => {
                                if (id === 'info') {
                                  console.log('show info');/* eslint no-console:0 */
                                }
                              }}
                                footerActions={[

                                // {
                                //   label: 'change password',
                                //   id: 'change password'
                                // }
                              ]}
                                asideActions={[
                                {
                                  label: <span>Open</span>,
                                  isColor: 'primary',
                                  id: 'open'
                                },
                                {
                                  label: 'duplicate',
                                  id: 'duplicate'
                                },
                                {
                                  label: 'info',
                                  id: 'info'
                                },
                                {
                                  label: <span>Delete</span>,
                                  isColor: 'danger',
                                  id: 'delete'
                                },
                              ]} />
                            </Column>
                          </Level>
                        ))
                      }
              </Column>
              {
                      newStoryOpen || storyInfoVisible ?
                        <Column isSize={newStoryOpen ? '2/3' : '1/2'}>
                          {
                              storyInfoVisible ?
                                <Column>
                                  <Title isSize={2}>
                                    <Columns>
                                      <Column isSize={11}>
                                        Story title
                                      </Column>
                                      <Column>
                                        <Delete onClick={
                                          () => setNewStoryOpen(false)
                                        } />
                                      </Column>
                                    </Columns>
                                  </Title>
                                  <Image src="https://inra-dam-front-resources-cdn.brainsonic.com/ressources/afile/224020-77d3e-picture_client_link_1-ouverture-dossier-controverse.JPG" />
                                  <Title isSize={4}>
                                    <i>Authors</i>
                                  </Title>
                                  <Content>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vestibulum sodales massa, non malesuada neque. Duis congue non ipsum at posuere. Morbi sit amet sodales est.
                                  </Content>
                                  <Button isColor="primary" isFullWidth>
                                    Read this story
                                  </Button>
                                </Column>
                              :
                                <Column>
                                  <Title isSize={2}>
                                    <Columns>
                                      <Column isSize={11}>
                                        New Story
                                      </Column>
                                      <Column>
                                        <Delete onClick={
                                          () => setNewStoryOpen(false)
                                        } />
                                      </Column>
                                    </Columns>
                                  </Title>
                                  <Tabs isBoxed isFullWidth>
                                    <Container>
                                      <TabList>
                                        <Tab onClick={() => setNewStoryTabMode('new-story')} isActive={newStoryTabMode === 'new-story'}><TabLink>Create a story</TabLink></Tab>
                                        <Tab onClick={() => setNewStoryTabMode('import-story')} isActive={newStoryTabMode === 'import-story'}><TabLink>Import an existing story</TabLink></Tab>
                                      </TabList>
                                    </Container>
                                  </Tabs>
                                  {newStoryTabMode === 'new-story' ?
                                    <form>
                                      <Field>
                                        <Control>
                                          <Label>
                                          Story title
                                            <HelpPin place="right">
                                            Explanation about the story title
                                            </HelpPin>
                                          </Label>
                                          <Input type="text" placeholder="Story title" />
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
                                        Story password
                                          <HelpPin place="right">
                                          Explanation about the story password
                                          </HelpPin>
                                        </Label>
                                        <Control hasIcons>
                                          <Input
                                            isColor="success" placeholder="Text Input" value="bloomer"
                                            type="password" />
                                          <Icon isSize="small" isAlign="left">
                                            <span className="fa fa-lock" aria-hidden="true" />
                                          </Icon>
                                          <Icon isSize="small" isAlign="right">
                                            <span className="fa fa-exclamation" aria-hidden="true" />
                                          </Icon>
                                        </Control>
                                        <Help isColor="danger">Password must be at least 6 characters long</Help>
                                      </Field>

                                      <Field>
                                        <Label>
                                      Authors
                                          <HelpPin place="right">
                                          Explanation about the story authors
                                          </HelpPin>
                                        </Label>
                                        <Control hasIcons>
                                          <Input isColor="success" placeholder="Text Input" value="bloomer" />
                                          <Icon isSize="small" isAlign="left">
                                            <span className="fa fa-user" aria-hidden="true" />
                                          </Icon>
                                          <Icon isSize="small" isAlign="right">
                                            <Delete />
                                          </Icon>
                                          <Button>
                                          Add an author
                                          </Button>
                                        </Control>
                                      </Field>
                                      <Field>
                                        <Label>Abstract</Label>
                                        <Control hasIcons>
                                          <TextArea placeholder={'abstract'} />
                                        </Control>
                                      </Field>
                                      <Columns>
                                        <Column>
                                          <Button isFullWidth isColor="success">
                                        Create a new story
                                          </Button>
                                        </Column>
                                        <Column>
                                          <Button isFullWidth isColor="danger">
                                        Cancel
                                          </Button>
                                        </Column>
                                      </Columns>
                                    </form>
                                    :
                                    <Column>
                                      <DropZone>
                                    Drop a fonio file
                                      </DropZone>
                                      <Level />
                                      <Columns>
                                        <Column>
                                          <Button isFullWidth isColor="success">
                                        Create a new story
                                          </Button>
                                        </Column>
                                        <Column>
                                          <Button isFullWidth isColor="danger">
                                        Cancel
                                          </Button>
                                        </Column>
                                      </Columns>
                                    </Column>
                                }
                                </Column>
                            }

                        </Column>
                      : null
                    }
            </Columns>
          </Container>
        );
    }
  }

  render = () => {
    const {
      props: {
        tabMode,
        actions: {
          setTabMode
        }
      },
      renderContent,
    } = this;
    return (
      <section>
        <Hero
          isColor="success"
          isSize="large"
          style={{
                background: `url(${require('../../../sharedAssets/cover_forccast.jpg')})`,
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                backgroundSize: 'cover',
                backgroundColor: '#999',
              }}>
          <HeroHeader>
            <Navbar
              isOpen={false}
              isFixed
              brandImage={icons.fonioBrand.svg}

              locationBreadCrumbs={[
              {
                href: '/',
                content: <strong>{'Scube 2018'}</strong>,
                isActive: true
              },
            ]}

              actionOptions={[
            {
              content: <LanguageToggler />
            }
            ]} />
          </HeroHeader>

          <HeroBody>
            <Container hasTextAlign="centered">
              <Title>{'Scube 2018'}</Title>
            </Container>
          </HeroBody>

          <HeroFooter>
            <Tabs isBoxed isFullWidth>
              <Container>
                <TabList>
                  <Tab onClick={() => setTabMode('stories')} isActive={tabMode === 'stories'}><TabLink>{this.translate('Stories')}</TabLink></Tab>
                  <Tab onClick={() => setTabMode('learn')} isActive={tabMode === 'learn'}><TabLink>{this.translate('Learn')}</TabLink></Tab>
                  <Tab onClick={() => setTabMode('about')} isActive={tabMode === 'about'}><TabLink>{this.translate('About')}</TabLink></Tab>
                </TabList>
              </Container>
            </Tabs>
          </HeroFooter>
        </Hero>

        <Container>
          <Level />
          {renderContent(tabMode)}
          <Level />
          <Level />
        </Container>

        <Footer id="footer">
          <Container>
            <Content>
              <Columns>
                <Column>
                  <p>
                    {this.translate('Made by medialab')}
                  </p>
                </Column>
              </Columns>
              <Content isSize="small">
                <p>{this.translate('The source code is licensed under ')}<a target="_blank">LGPL</a>.</p>
                <p>{this.translate('The website content is licensed under ')}<a target="_blank">CC ANS 4.0</a>.</p>
              </Content>
            </Content>
          </Container>
        </Footer>

      </section>
    );
  }
}


/**
 * Context data used by the component
 */
HomeViewLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};


export default HomeViewLayout;
