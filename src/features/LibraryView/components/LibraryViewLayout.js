import React from 'react';
import PropTypes from 'prop-types';

import {v4 as genId} from 'uuid';

import {
  Column,
  Columns,
  Content,
  Container,
  Level,

  DropZone,
  Dropdown,

  Field,
  Control,
  Input,
  Button,
  Checkbox,

  LevelLeft,
  LevelRight,
  LevelItem,
  Grid,
} from 'quinoa-design-library/components';

import {translateNameSpacer} from '../../../helpers/translateUtils';
import {
  getReverseResourcesLockMap,
  getUserResourceLockId,
} from '../../../helpers/lockUtils';

import ResourceForm from '../../../components/ResourceForm';

import ResourceCard from './ResourceCard';

const LibraryViewLayout = ({

  editedStory: story = {},
  userId,
  lockingMap = {},
  activeUsers,

  mainColumnMode,
  sortVisible,
  filterVisible,
  actions: {
    setSortVisible,
    setFilterVisible,
    setMainColumnMode,

    enterBlock,
    leaveBlock,

    createResource,
    updateResource,
    deleteResource,
  }
}, {t}) => {

  const {
    resources = {},
    id: storyId
  } = story;

  const resourcesList = Object.keys(resources).map(resourceId => resources[resourceId]);
  const userLockedResourceId = getUserResourceLockId(lockingMap, userId, storyId);
  const reverseResourcesLockMap = getReverseResourcesLockMap(lockingMap, activeUsers, storyId);
  const translate = translateNameSpacer(t, 'Features.LibraryView');

  const renderMainColumn = () => {
    if (userLockedResourceId) {
      const handleSubmit = resource => {
        const {id: resourceId} = resource;
        updateResource({
          resourceId,
          resource,
          storyId
        });
        leaveBlock({
          storyId,
          userId,
          blockType: 'resources',
          blockId: userLockedResourceId
        });
      };
      const handleCancel = () => {
        leaveBlock({
          storyId,
          userId,
          blockType: 'resources',
          blockId: userLockedResourceId
        });
      };
      return (<ResourceForm
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        resource={resources[userLockedResourceId]} asNew={false} />);
    }
    switch (mainColumnMode) {
      case 'new':
        const handleSubmit = resource => {
        const resourceId = genId();
        createResource({
          resourceId,
          resource: {
            ...resource,
            id: resourceId
          },
          storyId
        });
        setMainColumnMode('list');
      };
        return (
          <ResourceForm
            onCancel={() => setMainColumnMode('list')}
            onSubmit={handleSubmit}
            asNew />
        );
      case 'list':
      default:
        return (
          <div>

            <Column>
              <Level isMobile>
                <LevelLeft>
                  <Field hasAddons>
                    <Control>
                      <Input placeholder={translate('Find a resource')} />
                    </Control>
                    <Control>
                      <Button>{translate('Search')}</Button>
                    </Control>
                  </Field>
                </LevelLeft>
                <LevelRight>
                  <LevelItem>
                    <Dropdown
                      onToggle={() => {
                      setSortVisible(!sortVisible); setFilterVisible(false);
                      }}
                      isActive={sortVisible}
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
                      {translate('Sort')}
                    </Dropdown>
                  </LevelItem>
                  <LevelItem>
                    <Dropdown
                      onToggle={() => {
                      setFilterVisible(!filterVisible); setSortVisible(false);
                      }}
                      isActive={filterVisible}
                      value={{id: 1, label: '1 rem'}}
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
                      {translate('Filter')}
                    </Dropdown>
                  </LevelItem>
                </LevelRight>
              </Level>
            </Column>
            <div>
              <Grid columns={3}>
                {
                    resourcesList.map(resource => {
                      const handleEdit = () => {
                        enterBlock({
                          storyId,
                          userId,
                          blockType: 'resources',
                          blockId: resource.id
                        });
                      };
                      const handleDelete = () => {
                        deleteResource({
                          storyId,
                          userId,
                          resourceId: resource.id
                        });
                      };
                      return (
                        <ResourceCard
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          resource={resource}
                          lockData={reverseResourcesLockMap[resource.id]}
                          key={resource.id} />
                      );
                    })
                  }
              </Grid>
            </div>
          </div>
      );
    }
  };

  const handleNewResourceClick = () => {
    if (mainColumnMode === 'new') {
      setMainColumnMode('list');
    }
 else setMainColumnMode('new');
  };

  return (
    <Container isFluid>
      <Columns isFullHeight>
        <Column isSize={'1/4'}>
          <Level />
          <Level>
            <Content>
              {translate('Your library contains all the resources (references, images, visualizations...) that can be used within the story.')}
            </Content>
          </Level>
          <Level>
            <Button isFullWidth onClick={handleNewResourceClick} isColor={mainColumnMode === 'new' ? 'primary' : 'info'}>
              {translate('New resource')}
            </Button>
          </Level>
          <Level>
            <DropZone>
              {translate('Drop files to include new resources in your library (images, tables, bibliographies)')}
            </DropZone>
          </Level>
        </Column>
        <Column isSize={'3/4'}>
          {renderMainColumn()}
        </Column>
      </Columns>
    </Container>
    );
};

LibraryViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default LibraryViewLayout;
