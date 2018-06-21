import React from 'react';
import PropTypes from 'prop-types';

import {v4 as genId} from 'uuid';
import objectPath from 'object-path';

import resourceSchema from 'quinoa-schemas/resource';

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

import ConfirmToDeleteModal from '../../../components/ConfirmToDeleteModal';
import ResourceForm from '../../../components/ResourceForm';

import ResourceCard from './ResourceCard';

const resourceTypes = Object.keys(resourceSchema.definitions);

const LibraryViewLayout = ({

  editedStory: story = {},
  userId,
  lockingMap = {},
  activeUsers,

  mainColumnMode,
  sortVisible,
  filterVisible,
  filterValues,
  sortValue,
  searchString,
  promptedToDeleteResourceId,
  actions: {
    setSortVisible,
    setFilterVisible,
    setMainColumnMode,
    setSearchString,
    setFilterValues,
    setSortValue,
    setPromptedToDeleteResourceId,

    enterBlock,
    leaveBlock,

    createResource,
    updateResource,
    deleteResource,
    uploadResource,
    deleteUploadedResource,
  },
  submitMultiResources,
}, {t}) => {

  const {
    resources = {},
    id: storyId
  } = story;

  const activeFilters = Object.keys(filterValues).filter(key => filterValues[key]);
  const resourcesList = Object.keys(resources).map(resourceId => resources[resourceId]);

  const getResourceTitle = (resource) => {
    const titlePath = objectPath.get(resourceSchema, ['definitions', resource.metadata.type, 'title_path']);
    const title = titlePath ? objectPath.get(resource, titlePath) : resource.metadata.title;
    return title;
  };
  const visibleResources = resourcesList
    .filter(resource => {
      if (activeFilters.indexOf(resource.metadata.type) > -1) {
        if (searchString.length) {
         return JSON.stringify(resource).toLowerCase().indexOf(searchString.toLowerCase()) > -1;
        }
        return true;
      }
      return false;
    })
    .sort((a, b) => {
        switch (sortValue) {
          case 'edited recently':
            if (a.lastUpdateAt > b.lastUpdateAt) {
              return -1;
            }
            return 1;
          case 'title':
          default:
            const aTitle = getResourceTitle(a);
            const bTitle = getResourceTitle(b);
            if ((aTitle && bTitle) && aTitle.toLowerCase().trim() > bTitle.toLowerCase().trim()) {
              return 1;
            }
            return -1;
        }
      });
  const userLockedResourceId = getUserResourceLockId(lockingMap, userId, storyId);
  const reverseResourcesLockMap = getReverseResourcesLockMap(lockingMap, activeUsers, storyId);
  const translate = translateNameSpacer(t, 'Features.LibraryView');

  const toggleFilter = type => {
    setFilterValues({
      ...filterValues,
      [type]: filterValues[type] ? false : true
    });
  };

  const onDeleteResourceConfirm = () => {
    const resource = resources[promptedToDeleteResourceId];
    const payload = {
      storyId,
      userId,
      resourceId: resource.id
    };
    if (resource.metadata.type === 'image' || resource.metadata.type === 'table') {
      deleteUploadedResource(payload);
    }
    else {
      deleteResource(payload);
    }
    setPromptedToDeleteResourceId(undefined);
  };

  const renderMainColumn = () => {
    if (userLockedResourceId) {
      const handleSubmit = resource => {
        const {id: resourceId} = resource;
        const payload = {
          resourceId,
          resource,
          storyId,
          userId
        };
        if ((resource.metadata.type === 'image' && resource.data.base64) || (resource.metadata.type === 'table' && resource.data.json)) {
          uploadResource(payload, 'update');
        }
        else {
          updateResource(payload);
        }
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
        resource={resources[userLockedResourceId]} asNewResource={false} />);
    }
    switch (mainColumnMode) {
      case 'new':
        const handleSubmit = resource => {
          const resourceId = genId();
          const payload = {
            resourceId,
            resource: {
              ...resource,
              id: resourceId
            },
            storyId,
            userId,
          };
          if ((resource.metadata.type === 'image' && resource.data.base64) || (resource.metadata.type === 'table' && resource.data.json)) {
            uploadResource(payload, 'create');
          }
          else {
            createResource(payload);
          }
          setMainColumnMode('list');
        };
        return (
          <ResourceForm
            onCancel={() => setMainColumnMode('list')}
            onSubmit={handleSubmit}
            asNewResource />
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
                      <Input value={searchString} onChange={e => setSearchString(e.target.value)} placeholder={translate('Find a resource')} />
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
                        setSortVisible(!sortVisible);
                        setFilterVisible(false);
                      }}
                      onChange={setSortValue}
                      isActive={sortVisible}
                      value={{id: sortValue, label: translate(sortValue)}}
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
                      {translate('Sort')}
                    </Dropdown>
                  </LevelItem>
                  <LevelItem>
                    <Dropdown
                      onToggle={() => {
                        setFilterVisible(!filterVisible);
                        setSortVisible(false);
                      }}
                      isActive={filterVisible}
                      value={{id: 1, label: '1 rem'}}
                      onChange={toggleFilter}
                      options={
                        resourceTypes.map(type => ({
                          id: type,
                          label: <Field>
                            <Control>
                              <Checkbox
                                checked={filterValues[type]}>{translate(type)}</Checkbox>
                            </Control>
                          </Field>
                        }))
                        }>
                      {translate('Filter')}
                    </Dropdown>
                  </LevelItem>
                </LevelRight>
              </Level>
            </Column>
            <div>
              <Grid columns={3}>
                {
                    visibleResources.map(resource => {
                      const handleEdit = () => {
                        enterBlock({
                          storyId,
                          userId,
                          blockType: 'resources',
                          blockId: resource.id
                        });
                      };
                      const handleDelete = () => {
                        setPromptedToDeleteResourceId(resource.id);
                      };
                      return (
                        <ResourceCard
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          resource={resource}
                          getTitle={getResourceTitle}
                          lockData={reverseResourcesLockMap[resource.id]}
                          key={resource.id} />
                      );
                    })
                  }
              </Grid>
            </div>
            <ConfirmToDeleteModal
              isActive={promptedToDeleteResourceId}
              deleteType={'resource'}
              story={story}
              id={promptedToDeleteResourceId}
              onClose={() => setPromptedToDeleteResourceId(undefined)}
              onDeleteConfirm={onDeleteResourceConfirm} />
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
            <Button
              isDisabled={userLockedResourceId !== undefined} isFullWidth onClick={handleNewResourceClick}
              isColor={mainColumnMode === 'new' ? 'primary' : 'info'}>
              {translate('New resource')}
            </Button>
          </Level>
          <Level>
            <DropZone onDrop={submitMultiResources}>
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
