import React from 'react';
import PropTypes from 'prop-types';

import {v4 as genId} from 'uuid';
import {isEmpty} from 'lodash';
import objectPath from 'object-path';

import resourceSchema from 'quinoa-schemas/resource';

import {
  Column,
  Content,
  Container,
  Level,

  DropZone,
  Dropdown,

  Field,
  Control,
  Input,
  Image,
  Button,

  LevelLeft,
  LevelItem,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Grid,
} from 'quinoa-design-library/components';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import {
  removeContextualizationReferenceFromRawContents
} from '../../../helpers/assetsUtils';

import {translateNameSpacer} from '../../../helpers/translateUtils';
import {
  getReverseResourcesLockMap,
  getReverseSectionsLockMap,
  getCitedSections,
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
  optionsVisible,
  filterValues,
  sortValue,
  searchString,
  promptedToDeleteResourceId,
  actions: {
    setOptionsVisible,
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
    updateSection,
  },
  submitMultiResources,
}, {t}) => {

  const {
    resources = {},
    contextualizations = {},
    id: storyId
  } = story;

  const translate = translateNameSpacer(t, 'Features.LibraryView');
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
  const reverseSectionLockMap = getReverseSectionsLockMap(lockingMap, activeUsers, storyId);

  const reverseResourcesSectionsMap =
    Object.keys(contextualizations)
    .reduce((result, contextId) => {
      const context = contextualizations[contextId];
      const activeCitedSections =
        getCitedSections(contextualizations, context.resourceId)
          .filter(id => {
            return (reverseSectionLockMap[id] && reverseSectionLockMap[id].userId !== userId);
          });
      if (activeCitedSections.length > 0) {
        return {
          ...result,
          [context.resourceId]: {name: `other ${activeCitedSections.length} sections`}
        };
      }
      return result;
    }, {});

  const resourcesLockMap = isEmpty(reverseResourcesLockMap) ? reverseResourcesSectionsMap : reverseResourcesLockMap;
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
    // deleting entities in content states
    const relatedContextualizationsIds = Object.keys(story.contextualizations).map(c => story.contextualizations[c])
      .filter(contextualization => {
        return contextualization.resourceId === promptedToDeleteResourceId;
      }).map(c => c.id);

    if (relatedContextualizationsIds.length) {
      Object.keys(story.sections).forEach(key => {
        const section = story.sections[key];
        let sectionChanged;

        const newSection = {
          ...section,
          contents: relatedContextualizationsIds.reduce((temp, contId) => {
            const {changed, result} = removeContextualizationReferenceFromRawContents(temp, contId);
            if (changed && !sectionChanged) {
              sectionChanged = true;
            }
            return result;
          }, section.contents),
          notes: Object.keys(section.notes).reduce((temp1, noteId) => ({
            ...temp1,
            [noteId]: {
              ...section.notes[noteId],
              contents: relatedContextualizationsIds.reduce((temp, contId) => {
                const {changed, result} = removeContextualizationReferenceFromRawContents(temp, contId);
                if (changed && !sectionChanged) {
                  sectionChanged = true;
                }
                return result;
              }, section.notes[noteId].contents)
            }
          }), {})
        };
        if (sectionChanged) {
          updateSection({
            sectionId: section.id,
            storyId: story.id,
            userId,
            section: newSection,
          });
        }
      });
    }

    // deleting the resource
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
        const setOption = (option, optionDomain) => {
          if (optionDomain === 'filter') {
            toggleFilter(option);
          }
          else if (optionDomain === 'sort') {
            setSortValue(option);
          }
        };
        return (
          <StretchedLayoutContainer isAbsolute>
            <StretchedLayoutItem>
              <Column>
                <Level isMobile>
                  <LevelLeft>
                    <Field hasAddons>
                      <Control>
                        <Input value={searchString} onChange={e => setSearchString(e.target.value)} placeholder={translate('Find a resource')} />
                      </Control>
                    </Field>
                    <LevelItem>
                      <Dropdown
                        closeOnChange={false}
                        menuAlign="right"
                        onToggle={() => {
                          setOptionsVisible(!optionsVisible);
                        }}
                        onChange={setOption}
                        isActive={optionsVisible}
                        value={{
                          sort: {
                            value: sortValue,
                          },
                          filter: {
                            value: Object.keys(filterValues).filter(f => filterValues[f]),
                          }
                        }}
                        options={[
                          {
                            label: translate('Sort items by'),
                            id: 'sort',
                            options: [
                              {
                                id: 'edited recently',
                                label: translate('edited recently')
                              },
                              {
                                id: 'title',
                                label: translate('title')
                              },
                            ]
                          },
                          {
                            label: translate('Filter by'),
                            id: 'filter',
                            options: resourceTypes.map(type => ({
                              id: type,
                              label: <span><Image style={{display: 'inline-block'}} isSize={'16x16'} src={icons[type].black.svg} /><span>{translate(type)}</span></span>
                            })),
                          }
                        ]}>
                        {translate('Options')}
                      </Dropdown>
                    </LevelItem>
                  </LevelLeft>
                </Level>
              </Column>
            </StretchedLayoutItem>
            <StretchedLayoutItem isFlex={1} isFlowing>
              <Column>
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
                            lockData={resourcesLockMap[resource.id]}
                            key={resource.id} />
                        );
                      })
                    }
                </Grid>
              </Column>
            </StretchedLayoutItem>
            <ConfirmToDeleteModal
              isActive={promptedToDeleteResourceId}
              isDisabled={resourcesLockMap[promptedToDeleteResourceId]}
              deleteType={'resource'}
              story={story}
              id={promptedToDeleteResourceId}
              onClose={() => setPromptedToDeleteResourceId(undefined)}
              onDeleteConfirm={onDeleteResourceConfirm} />
          </StretchedLayoutContainer>
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
    <Container style={{position: 'relative', height: '100%'}}>
      <StretchedLayoutContainer isFluid isDirection="horizontal" isAbsolute>
        <StretchedLayoutItem className="is-hidden-mobile" isFlex={'1'}>
          <Column>
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
        </StretchedLayoutItem>
        <StretchedLayoutItem isFlex={'3'}>
          <Column isWrapper>
            {renderMainColumn()}
          </Column>
        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    </Container>
    );
};

LibraryViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default LibraryViewLayout;
