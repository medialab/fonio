import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Checkbox,
  Column,
  Control,
  Dropdown,
  DropZone,
  Field,
  Input,
  Level,
  Tab,
  TabLink,
  TabList,
  Tabs,
} from 'quinoa-design-library/components/';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import ResourceMiniCard from './ResourceMiniCard';
import SortableMiniSectionsList from './SortableMiniSectionsList';

const AsideSectionColumn = ({
  asideTabCollapsed,
  asideTabMode,
  resourceSortVisible,
  resourceFilterVisible,
  mainColumnMode,
  story,
  sections,

  setAsideTabCollapsed,
  setAsideTabMode,
  setResourceSortVisible,
  setResourceFilterVisible,
  setMainColumnMode,

  onDeleteSection,
  onOpenSectionSettings,
  onSortEnd,
}, {t}) => {
  const translate = translateNameSpacer(t, 'Features.SectionView');

  // const {id: storyId} = story;

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
                onChange={id => console.log('set resource sorting mode to ', id)/* eslint no-console : 0 */}
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
                onChange={id => console.log('set resource filtering mode to ', id)/* eslint no-console : 0 */}
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
              <Button isFullWidth onClick={() => setMainColumnMode('newresource')} isColor={mainColumnMode === 'newresource' ? 'primary' : 'info'}>
                New resource
              </Button>
            </Level>
            {
                Object.keys(story.resources)
                .map(id => story.resources[id])
                .map(resource => {
                  return (
                    <Column style={{margin: '0 0 1rem 0', padding: 0}} key={resource.id}>
                      <ResourceMiniCard
                        resource={resource}
                        onEdit={() => setMainColumnMode('editresource')} />
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
            <SortableMiniSectionsList
              items={sections}
              onSortEnd={onSortEnd}
              onOpenSettings={thatSection => onOpenSectionSettings(thatSection.id)}
              onDeleteSection={(thatSection) => onDeleteSection(thatSection.id)}
              useDragHandle />
            <Column style={{margin: '0 0 1rem 0', padding: 0}}>
              <Button onClick={() => setMainColumnMode('newsection')} isColor={'primary'} isFullWidth>
                {translate('New section')}
              </Button>
            </Column>
          </Column>
        );
    }
  };

  return (
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
  );
};

AsideSectionColumn.contextTypes = {
  t: PropTypes.func,
};

export default AsideSectionColumn;
