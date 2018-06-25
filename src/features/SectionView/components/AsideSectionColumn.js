import React, {Component} from 'react';
import PropTypes from 'prop-types';

import resourceSchema from 'quinoa-schemas/resource';

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

import ResourcesList from './ResourcesList';
import SortableMiniSectionsList from './SortableMiniSectionsList';

const resourceTypes = Object.keys(resourceSchema.definitions);

class AsideSectionColumn extends Component {

  shouldComponentUpdate = nextProps => {
    const changingProps = [
      'asideTabCollapsed',
      'asideTabMode',
      'resourceSortVisible',
      'resourceFilterVisible',
      'mainColumnMode',
      'activeUsers',
      'lockMap',
      'userLockedResourceId',

      'resourceSearchString',
      'resourceFilterValues',
      'resourceSortValue',
    ];
    const {
      story: {
        resources: prevResources,
        sectionsOrder: prevSectionsOrder
      }
    } = this.props;
    const {
      story: {
        resources: nextResources,
        sectionsOrder: nextSectionsOrder
      }
    } = nextProps;
    return (
      changingProps.find(propName => this.props[propName] !== nextProps[propName]) !== undefined
      || prevResources !== nextResources
      || prevSectionsOrder !== nextSectionsOrder
    );
  }
  render = () => {
    const {
      asideTabCollapsed,
      asideTabMode,
      resourceSortVisible,
      resourceFilterVisible,
      mainColumnMode,
      story,

      getResourceTitle,
      sections,

      userId,

      reverseResourcesLockMap,
      userLockedResourceId,

      setAsideTabCollapsed,
      setAsideTabMode,
      setResourceSortVisible,
      setResourceFilterVisible,
      setMainColumnMode,

      visibleResources,
      resourceSearchString,
      setResourceSearchString,
      resourceFilterValues,
      setResourceFilterValues,
      resourceSortValue,
      setResourceSortValue,

      onResourceEditAttempt,

      onDeleteResource,
      submitMultiResources,

      onDeleteSection,
      onOpenSectionSettings,
      onSortEnd,
    } = this.props;
    const {t} = this.context;
    const translate = translateNameSpacer(t, 'Features.SectionView');
    const {id: storyId} = story;

    const toggleResourceFilter = type => {
      setResourceFilterValues({
        ...resourceFilterValues,
        [type]: resourceFilterValues[type] ? false : true
      });
    };

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
                  <Input value={resourceSearchString} onChange={e => setResourceSearchString(e.target.value)} placeholder={translate('find a resource')} />
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
                  onChange={setResourceSortValue}
                  isActive={resourceSortVisible}
                  value={{id: resourceSortValue, label: translate(resourceSortValue)}}
                  options={[
                    {
                      id: 'edited recently',
                      label: translate('edited recently')
                    },
                    {
                      id: 'title',
                      label: translate('title')
                    },
                  ]}>
                  {translate('Sort resources')}
                </Dropdown>
                <Dropdown
                  onToggle={() => {
                    setResourceFilterVisible(!resourceFilterVisible);
                    setResourceSortVisible(false);
                  }}
                  isActive={resourceFilterVisible}
                  value={{id: 1, label: '1 rem'}}
                  onChange={toggleResourceFilter}
                  options={
                    resourceTypes.map(type => ({
                      id: type,
                      label: <Field>
                        <Control>
                          <Checkbox
                            checked={resourceFilterValues[type]}>{translate(type)}</Checkbox>
                        </Control>
                      </Field>
                    }))
                    }>
                  {translate('Filter resources')}
                </Dropdown>
              </Level>
              <Level>
                <Button
                  isFullWidth
                  onClick={() => setMainColumnMode('newresource')}
                  isColor={mainColumnMode === 'newresource' ? 'primary' : 'info'}
                  isDisabled={userLockedResourceId !== undefined}>
                  {translate('New resource')}
                </Button>
              </Level>
              <ResourcesList
                resources={visibleResources}
                onDeleteResource={onDeleteResource}
                storyId={storyId}
                userId={userId}
                onResourceEditAttempt={onResourceEditAttempt}
                reverseResourcesLockMap={reverseResourcesLockMap}
                getResourceTitle={getResourceTitle}
                userLockedResourceId={userLockedResourceId} />
              {
                  /*visibleResources
                  .map(resource => {
                    const handleDelete = () => {
                      deleteResource({
                        storyId,
                        userId,
                        resourceId: resource.id
                      });
                    };
                    const handleEdit = () => {
                      onResourceEditAttempt(resource.id);
                    };
                    return (
                      <Column style={{margin: '0 0 1rem 0', padding: 0}} key={resource.id}>
                        <ResourceMiniCard
                          resource={resource}
                          onDelete={handleDelete}
                          lockData={reverseResourcesLockMap[resource.id]}
                          isActive={userLockedResourceId}
                          onEdit={handleEdit} />
                      </Column>
                    );
                  })*/
                }
              <Level>
                <DropZone onDrop={submitMultiResources}>
                  {translate('Drop files to include new resources in your library (images, tables, bibliographies)')}
                </DropZone>
              </Level>
            </Column>
          );
        case 'summary':
        default:
          return (
            <Column>
              <SortableMiniSectionsList
                storyId={storyId}
                items={sections}
                onSortEnd={onSortEnd}
                onOpenSettings={thatSection => onOpenSectionSettings(thatSection.id)}
                onDeleteSection={onDeleteSection}
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
  }
}

AsideSectionColumn.contextTypes = {
  t: PropTypes.func,
};

export default AsideSectionColumn;
