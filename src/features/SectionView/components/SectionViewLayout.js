import React from 'react';
import PropTypes from 'prop-types';

import ReactTooltip from 'react-tooltip';

import {
  BigSelect,
  Button,
  Card,
  Checkbox,
  Column,
  Columns,
  Control,
  Delete,
  Dropdown,
  DropZone,
  Field,
  HelpPin,
  Icon,
  Input,
  Label,
  Level,
  StatusMarker,
  Tab,
  TabLink,
  TabList,
  Tabs,
  TextArea,
  Title,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import {translateNameSpacer} from '../../../helpers/translateUtils';

const resourceTypes = ['bib', 'image', 'video', 'embed', 'webpage', 'table', 'glossary'];


const SectionViewLayout = ({
  asideTabMode,
  asideTabCollapsed,
  mainColumnMode,
  resourceSortVisible,
  resourceFilterVisible,

  story,
  section,
  actions: {
    setAsideTabMode,
    setAsideTabCollapsed,
    setMainColumnMode,
    setResourceSortVisible,
    setResourceFilterVisible,
  }
}, {
  t
}) => {
  const translate = translateNameSpacer(t, 'Features.SectionView');

  const renderAside = () => {
    if (asideTabCollapsed) {
      return null;
    }
    switch (asideTabMode) {
      case 'library':
        return (
          <Column>
            <Field hasAddons>
              <Control>
                <Input placeholder={translate('find a resource')} />
              </Control>
              <Control>
                <Button>{translate('search')}</Button>
              </Control>
            </Field>
            <Level>
              <Dropdown
                onToggle={() => {
                  setResourceSortVisible(!resourceSortVisible);
                  setResourceFilterVisible(false);
                }}
                onChange={id => console.log('set resource sorting mode to ', id)}
                isActive={resourceSortVisible}
                value={{id: 'lastmod', label: 'last modification'}}
                options={[
                  {
                    id: 'lastmod',
                    label: 'last modification'
                  },
                  {
                    id: 'creation',
                    label: 'creation'
                  },
                  {
                    id: 'title',
                    label: 'title'
                  },
                ]}>
                {translate('sort resources')}
              </Dropdown>
              <Dropdown
                onToggle={() => {
                  setResourceSortVisible(false);
                  setResourceFilterVisible(!resourceFilterVisible);
                }}
                onChange={id => console.log('set resource filtering mode to ', id)}
                isActive={resourceFilterVisible}
                value={{id: '1', label: '1 rem'}}
                options={[
                    {
                      id: 'images',
                      label: <Field>
                        <Control>
                          <Checkbox checked>Images</Checkbox>
                        </Control>
                      </Field>
                    },
                    {
                      id: 'videos',
                      label: <Field>
                        <Control>
                          <Checkbox>Videos</Checkbox>
                        </Control>
                      </Field>
                    },
                    {
                      id: 'all',
                      label: 'Select all'
                    }
                  ]}>
                {translate('filter')}
              </Dropdown>
            </Level>
            <Level>
              <Button isFullWidth onClick={() => setMainColumnMode('newresource')} isColor={mainColumnMode === 'new' ? 'primary' : 'info'}>
                New resource
              </Button>
            </Level>
            {
                Object.keys(story.resources)
                .map(id => story.resources[id])
                .map(resource => {
                  return (
                    <Column style={{margin: '0 0 1rem 0', padding: 0}} key={resource.id}>
                      <Card
                        key={resource.id}
                        bodyContent={
                          <div>
                            <Columns>
                              <Column isSize={2}>
                                <Icon isSize="medium" isAlign="left">
                                  <img src={icons[resource.metadata.type].black.svg} />
                                </Icon>
                              </Column>

                              <Column isSize={8}>
                                {resource.metadata.title}
                              </Column>

                              <Column isSize={2}>
                                <StatusMarker
                                  lockStatus={'open'}
                                  statusMessage={'open'} />
                              </Column>
                            </Columns>
                            <Columns>
                              <Column isOffset={2} isSize={10}>
                                <Button data-for="card-action" data-tip={'drag this card to the editor'}>
                                  <Icon isSize="small" isAlign="left">
                                    <img src={icons.move.black.svg} />
                                  </Icon>
                                </Button>
                                <Button onClick={() => setMainColumnMode('editresource')} data-for="card-action" data-tip={'settings'}>
                                  <Icon isSize="small" isAlign="left">
                                    <img src={icons.settings.black.svg} />
                                  </Icon>
                                </Button>
                                <Button data-for="card-action" data-tip={'delete this resource'}>
                                  <Icon isSize="small" isAlign="left">
                                    <img src={icons.remove.black.svg} />
                                  </Icon>
                                </Button>
                                <Button data-for="card-action" data-tip={'use as cover image'}>
                                  <Icon isSize="small" isAlign="left">
                                    <img src={icons.cover.black.svg} />
                                  </Icon>
                                </Button>
                              </Column>
                            </Columns>
                            <ReactTooltip
                              place="right"
                              effect="solid"
                              id="card-action" />
                          </div>
                          } />
                    </Column>
                  );
                })
              }
            <Level>
              <DropZone>
                 Drop files to include new resources in your library (images, tables, bibliographies)
              </DropZone>
            </Level>
          </Column>
        );
      case 'summary':
      default:
        return (
          <Column>
            {
                  Object.keys(story.sections)
                  .map(sectionId => story.sections[sectionId])
                  .map((thatSection, index) => {
                    return (
                      <Column style={{margin: '0 0 1rem 0', padding: 0}} key={index}>
                        <Card
                          bodyContent={
                            <div>
                              <Columns>
                                <Column isSize={2}>
                                  <Icon isSize="medium" isAlign="left">
                                    <img src={icons.section.black.svg} />
                                  </Icon>
                                </Column>

                                <Column isSize={8}>
                                  {thatSection.metadata.title}
                                </Column>

                                <Column isSize={2}>
                                  <StatusMarker
                                    lockStatus={thatSection.lockStatus}
                                    statusMessage={thatSection.statusMessage} />
                                </Column>
                              </Columns>
                              <Columns>
                                <Column isOffset={2} isSize={10}>
                                  <Button data-for="card-action" data-tip={'drag to change section order'}>
                                    <Icon isSize="small" isAlign="left">
                                      <img src={icons.move.black.svg} />
                                    </Icon>
                                  </Button>
                                  <Button data-for="card-action" data-tip={'section settings'}>
                                    <Icon isSize="small" isAlign="left">
                                      <img src={icons.settings.black.svg} />
                                    </Icon>
                                  </Button>
                                  <Button data-for="card-action" data-tip={'delete this section'}>
                                    <Icon isSize="small" isAlign="left">
                                      <img src={icons.remove.black.svg} />
                                    </Icon>
                                  </Button>

                                </Column>
                                <ReactTooltip
                                  place="right"
                                  effect="solid"
                                  id="card-action" />
                              </Columns>
                            </div>
                          } />
                      </Column>
                  );
                  })
                }
          </Column>
        );
    }
  };

  const renderMain = () => {
    const renderResourceForm = () => {
      return (<div>
        <Columns>
          <Column>
            <Field>
              <Control>
                <Label>
                    Url of the video
                  <HelpPin place="right">
                      Explanation about the video url
                  </HelpPin>
                </Label>
                <Input type="text" placeholder="Video url" />
              </Control>
            </Field>
          </Column>
          <Column>
            <Title isSize={5}>
                  Preview
            </Title>
            <iframe
              src="https://www.youtube.com/embed/QHDRRxKlimY?rel=0&amp;controls=0&amp;showinfo=0" frameBorder="0" allow="autoplay; encrypted-media"
              allowFullScreen />
          </Column>
        </Columns>
        <Level />
        <Columns>
          <Column>
            <Field>
              <Control>
                <Label>
                      Title of the video
                  <HelpPin place="right">
                      Explanation about the video title
                  </HelpPin>
                </Label>
                <Input type="text" placeholder="Video title" />
              </Control>
            </Field>
            <Field>
              <Control>
                <Label>
                    Source of the video
                  <HelpPin place="right">
                      Explanation about the video source
                  </HelpPin>
                </Label>
                <Input type="text" placeholder="Video source" />
              </Control>
            </Field>
          </Column>
          <Column>
            <Field>
              <Control>
                <Label>
                    Description of the video
                  <HelpPin place="right">
                      Explanation about the video description
                  </HelpPin>
                </Label>
                <TextArea type="text" placeholder="Video description" />
              </Control>
            </Field>
          </Column>
        </Columns>
      </div>);
    };
    switch (mainColumnMode) {
      case 'newresource':
        return (
          <div>
            <Level />
            <Title isSize={2}>
              <Columns>
                <Column isSize={11}>
                  Create a new resource
                </Column>
                <Column>
                  <Delete onClick={
                    () => setMainColumnMode('list')
                  } />
                </Column>
              </Columns>
            </Title>
            <BigSelect
              activeOptionId={'image'}
              options={
                resourceTypes.map(type => ({
                  id: type,
                  label: type,
                  iconUrl: icons[type].black.svg
                }))
              } />
            {renderResourceForm()}
          </div>
        );
      case 'editresource':
        return (
          <div>
            <Level />
            <Title isSize={2}>
              <Columns>
                <Column isSize={11}>
                  Edit video
                </Column>
                <Column>
                  <Delete onClick={
                    () => setMainColumnMode('list')
                  } />
                </Column>
              </Columns>
            </Title>
            {renderResourceForm()}
          </div>
        );
      case 'edit':
      default:
        return <div>Editor here</div>;
    }
  };

  return (
    <div>
      <Columns isFullHeight>
        <Column isSize={asideTabCollapsed ? 1 : '1/4'}>
          <Tabs isBoxed isFullWidth>
            <TabList>
              {
                !asideTabCollapsed &&
                <Tab onClick={() => setAsideTabMode('library')} isActive={asideTabMode === 'library'}>
                  <TabLink>{translate('Library')}</TabLink>
                </Tab>
              }
              {
                !asideTabCollapsed &&
                'collapse' &&
                <Tab onClick={() => setAsideTabMode('summary')} isActive={asideTabMode === 'summary'}>
                  <TabLink>
                    {translate('Summary')}
                  </TabLink>
                </Tab>
              }
              <Tab onClick={() => setAsideTabCollapsed(!asideTabCollapsed)} isActive={asideTabCollapsed}><TabLink>{asideTabCollapsed ? '▶' : '◀'}</TabLink></Tab>
            </TabList>
          </Tabs>
          {renderAside()}
        </Column>
        <Column isSize={'fullwidth'}>
          {renderMain()}
        </Column>
      </Columns>
    </div>
  );
};

SectionViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default SectionViewLayout;
