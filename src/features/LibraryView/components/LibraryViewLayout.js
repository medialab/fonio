/* eslint react/no-set-state : 0 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {v4 as genId} from 'uuid';
import {isEmpty, debounce, uniq} from 'lodash';

import FlipMove from 'react-flip-move';

import resourceSchema from 'quinoa-schemas/resource';
import {getResourceTitle, searchResources} from '../../../helpers/resourcesUtils';
import {createBibData} from '../../../helpers/resourcesUtils';


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
  ModalCard,

  LevelLeft,
  LevelRight,
  LevelItem,
  StretchedLayoutContainer,
  StretchedLayoutItem,
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

class LibraryViewLayout extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searchString: ''
    };
    this.setResourceSearchString = debounce(this.setResourceSearchString, 500);
  }

  componentDidMount = () => {
    const {searchString} = this.props;
    this.setState({
      searchString
    });
  }

  setResourceSearchString = (value) => this.props.actions.setSearchString(value)

  setResourceSearchStringDebounce = (value) => {
    this.setState({
      searchString: value
    });
    this.setResourceSearchString(value);
  }

  render = () => {
    const {
      editedStory: story = {},
      userId,
      lockingMap = {},
      activeUsers,

      mainColumnMode,
      optionsVisible,
      filterValues,
      sortValue,
      statusFilterValue,
      searchString,
      promptedToDeleteResourceId,
      selectedResourcesIds,
      resourcesPromptedToDelete,
      actions: {
        setOptionsVisible,
        setMainColumnMode,
        // setSearchString,
        setFilterValues,
        setSortValue,
        setStatusFilterValue,
        setPromptedToDeleteResourceId,

        enterBlock,
        leaveBlock,

        createResource,
        updateResource,
        deleteResource,
        uploadResource,
        deleteUploadedResource,
        updateSection,
        setSelectedResourcesIds,
        setResourcesPromptedToDelete,
      },
      submitMultiResources,
    } = this.props;
    const {t} = this.context;

    const {
      resources = {},
      contextualizations = {},
      id: storyId
    } = story;

    const translate = translateNameSpacer(t, 'Features.LibraryView');
    const activeFilters = Object.keys(filterValues).filter(key => filterValues[key]);
    const statusFilterValues = [
      {
        id: 'all',
        label: translate('all items')
      },
      {
        id: 'unlocked',
        label: translate('only editable items (not used by another author)')
      },
      {
        id: 'unused',
        label: translate('only unused items (not mentionned anywhere in the story)')
      }
    ];

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

    const actualResourcesPromptedToDelete = resourcesPromptedToDelete.filter(resourceId => resourcesLockMap[resourceId] === undefined);


    const resourcesList = Object.keys(resources).map(resourceId => resources[resourceId]);
    let visibleResources = searchString.length === 0 ? resourcesList : searchResources(resourcesList, searchString);

    visibleResources = visibleResources
      .filter(resource => {
        return activeFilters.indexOf(resource.metadata.type) > -1;
      })
      .filter(resource => {
        switch (statusFilterValue) {
          case 'unlocked':
            return !resourcesLockMap[resource.id];
          case 'unused':
            const citedResources = Object.keys(story.contextualizations)
              .map(contextualizationId => story.contextualizations[contextualizationId].resourceId);
            return citedResources.indexOf(resource.id) === -1;
          case 'all':
          default:
            return true;
        }
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


    const toggleFilter = type => {
      setFilterValues({
        ...filterValues,
        [type]: filterValues[type] ? false : true
      });
    };

    const onDeleteResourceConfirm = (thatResourceId) => {
      const realResourceId = typeof thatResourceId === 'string' ? thatResourceId : promptedToDeleteResourceId;
      const resource = resources[realResourceId];
      if (!resource || resourcesLockMap[resource.id]) {
        return;
      }
      const payload = {
        storyId,
        userId,
        resourceId: resource.id
      };
      // deleting entities in content states
      const relatedContextualizations = Object.keys(story.contextualizations).map(c => story.contextualizations[c])
        .filter(contextualization => {
          return contextualization.resourceId === realResourceId;
        });

      const relatedContextualizationsIds = relatedContextualizations.map(c => c.id);
      const relatedContextualizationsSectionIds = uniq(relatedContextualizations.map(c => c.sectionId));

      if (relatedContextualizationsIds.length) {
        const changedSections = relatedContextualizationsSectionIds.reduce((tempSections, sectionId) => {
          const section = tempSections[sectionId] || story.sections[sectionId];
          const sectionRelatedContextualizations = relatedContextualizations.filter(c => c.sectionId === sectionId);
          let sectionChanged;
          const newSection = {
            ...section,
            contents: sectionRelatedContextualizations.reduce((temp, cont) => {
              const {changed, result} = removeContextualizationReferenceFromRawContents(temp, cont.id);
              if (changed && !sectionChanged) {
                sectionChanged = true;
              }
              return result;
            }, {...section.contents}),
            notes: Object.keys(section.notes).reduce((temp1, noteId) => ({
              ...temp1,
              [noteId]: {
                ...section.notes[noteId],
                contents: sectionRelatedContextualizations.reduce((temp, cont) => {
                  const {changed, result} = removeContextualizationReferenceFromRawContents(temp, cont.id);
                  if (changed && !sectionChanged) {
                    sectionChanged = true;
                  }
                  return result;
                }, {...section.notes[noteId].contents})
              }
            }), {})
          };
          if (sectionChanged) {
            return {
              ...tempSections,
              [sectionId]: newSection
            };
          }
          return tempSections;
        }, {});
        Object.keys(changedSections).forEach(sectionId => {
          updateSection({
            sectionId,
            storyId: story.id,
            userId,
            section: changedSections[sectionId],
          });
        });

       setPromptedToDeleteResourceId(undefined);
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

    const onDeleteResourcesPromptedToDelete = () => {
      // cannot mutualize with single resource deletion for now
      // because section contents changes must be done all in the same time
      // @todo try to factor this
      // actualResourcesPromptedToDelete.forEach(onDeleteResourceConfirm);
      // 1. delete entity mentions
      // we need to do it all at once to avoid discrepancies
      const finalChangedSections = actualResourcesPromptedToDelete.reduce((tempFinalSections, resourceId) => {
        const resource = resources[resourceId];
        if (!resource || resourcesLockMap[resource.id]) {
          return;
        }
        // deleting entities in content states
        const relatedContextualizations = Object.keys(story.contextualizations).map(c => story.contextualizations[c])
          .filter(contextualization => {
            return contextualization.resourceId === resourceId;
          });

        const relatedContextualizationsIds = relatedContextualizations.map(c => c.id);
        const relatedContextualizationsSectionIds = uniq(relatedContextualizations.map(c => c.sectionId));

        if (relatedContextualizationsIds.length) {
          const changedSections = relatedContextualizationsSectionIds.reduce((tempSections, sectionId) => {
            const section = tempSections[sectionId] || story.sections[sectionId];
            const sectionRelatedContextualizations = relatedContextualizations.filter(c => c.sectionId === sectionId);
            let sectionChanged;
            const newSection = {
              ...section,
              contents: sectionRelatedContextualizations.reduce((temp, cont) => {
                const {changed, result} = removeContextualizationReferenceFromRawContents(temp, cont.id);
                if (changed && !sectionChanged) {
                  sectionChanged = true;
                }
                return result;
              }, {...section.contents}),
              notes: Object.keys(section.notes).reduce((temp1, noteId) => ({
                ...temp1,
                [noteId]: {
                  ...section.notes[noteId],
                  contents: sectionRelatedContextualizations.reduce((temp, cont) => {
                    const {changed, result} = removeContextualizationReferenceFromRawContents(temp, cont.id);
                    if (changed && !sectionChanged) {
                      sectionChanged = true;
                    }
                    return result;
                  }, {...section.notes[noteId].contents})
                }
              }), {})
            };
            if (sectionChanged) {
              return {
                ...tempSections,
                [sectionId]: newSection
              };
            }
            return tempSections;
          }, tempFinalSections);

          if (Object.keys(changedSections).length) {
            return {
              ...tempFinalSections,
              ...changedSections
            };
          }
        }
        return tempFinalSections;
      }, {});

      Object.keys(finalChangedSections).forEach(sectionId => {
        updateSection({
          sectionId,
          storyId: story.id,
          userId,
          section: finalChangedSections[sectionId],
        });
      });

      // 2. delete the resources
      actualResourcesPromptedToDelete.forEach(resourceId => {
        const resource = resources[resourceId];
        const payload = {
          storyId,
          userId,
          resourceId
        };
        // deleting the resource
        if (resource.metadata.type === 'image' || resource.metadata.type === 'table') {
          deleteUploadedResource(payload);
        }
        else {
          deleteResource(payload);
        }
      });
      setPromptedToDeleteResourceId(undefined);
      setResourcesPromptedToDelete([]);
    };

    let endangeredContextualizationsLength = 0;
    if (actualResourcesPromptedToDelete.length) {
      endangeredContextualizationsLength = actualResourcesPromptedToDelete.reduce((sum, resourceId) => {
        return sum + Object.keys(story.contextualizations)
                .filter(contextualizationId => story.contextualizations[contextualizationId].resourceId === resourceId)
                .length;
      }, 0);
    }

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
          else if (resource.metadata.type === 'bib') {
            createBibData(resource, this.props);
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
            else if (resource.metadata.type === 'bib') {
              createBibData(resource, this.props);
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
              setOptionsVisible(false);
            }
 else if (optionDomain === 'status') {
              setStatusFilterValue(option);
              setOptionsVisible(false);
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
                          <Input value={this.state.searchString} onChange={e => this.setResourceSearchStringDebounce(e.target.value)} placeholder={translate('Find a resource')} />
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
                            },
                            status: {
                              value: statusFilterValue,
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
                              label: translate('Show items of type'),
                              id: 'filter',
                              options: resourceTypes.map(type => ({
                                id: type,
                                label: <span style={{display: 'flex', flexFlow: 'row nowrap', alignItems: 'center'}}><Image style={{display: 'inline-block', marginRight: '1em'}} isSize={'16x16'} src={icons[type].black.svg} /><span>{translate(type)}</span></span>
                              })),
                            },
                            {
                              label: translate('Show ...'),
                              id: 'status',
                              options: statusFilterValues.map(type => ({
                                id: type.id,
                                label: type.label
                              })),
                            }
                          ]}>
                          {translate('Options')}
                        </Dropdown>
                      </LevelItem>
                    </LevelLeft>
                    <LevelRight>
                      <LevelItem>
                        <Button
                          onClick={() => setSelectedResourcesIds(visibleResources.map(res => res.id).filter(id => !resourcesLockMap[id]))}
                          isDisabled={selectedResourcesIds.length === visibleResources.length}>
                          {translate('Select all')}
                        </Button>
                      </LevelItem>
                      <LevelItem>
                        <Button
                          onClick={() => setSelectedResourcesIds([])}
                          isDisabled={selectedResourcesIds.length === 0}>
                          {translate('Deselect all')}
                        </Button>
                      </LevelItem>
                      <LevelItem>
                        <Button
                          isColor="danger"
                          onClick={() => setResourcesPromptedToDelete([...selectedResourcesIds])}
                          isDisabled={selectedResourcesIds.length === 0}>
                          {translate('Delete selection')}
                        </Button>
                      </LevelItem>
                    </LevelRight>
                  </Level>
                </Column>
              </StretchedLayoutItem>
              <StretchedLayoutItem isFlex={1} isFlowing>
                <Column>
                  <FlipMove style={{display: 'flex', flexFlow: 'row wrap'}}>
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
                          const isSelected = selectedResourcesIds.indexOf(resource.id) > -1;
                          const handleClick = () => {
                            let newSelectedResourcesIds;
                            if (resourcesLockMap[resource.id] === undefined) {
                              if (isSelected) {
                                newSelectedResourcesIds = selectedResourcesIds.filter(id => id !== resource.id);
                              }
                              else {
                                newSelectedResourcesIds = [...selectedResourcesIds, resource.id];
                              }
                              setSelectedResourcesIds(newSelectedResourcesIds);
                            }
                          };
                          return (
                            <ResourceCard
                              isActive={isSelected}
                              isSelectable={!resourcesLockMap[resource.id]}
                              onClick={handleClick}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              resource={resource}
                              getTitle={getResourceTitle}
                              lockData={resourcesLockMap[resource.id]}
                              key={resource.id} />
                          );
                        })
                      }
                  </FlipMove>
                </Column>
              </StretchedLayoutItem>
              <ConfirmToDeleteModal
                isActive={promptedToDeleteResourceId !== undefined}
                isDisabled={resourcesLockMap[promptedToDeleteResourceId]}
                deleteType={'resource'}
                story={story}
                id={promptedToDeleteResourceId}
                onClose={() => setPromptedToDeleteResourceId(undefined)}
                onDeleteConfirm={onDeleteResourceConfirm} />
              <ModalCard
                isActive={actualResourcesPromptedToDelete.length > 0}
                headerContent={translate(['Delete an item', 'Delete {n} items', 'n'], {n: actualResourcesPromptedToDelete.length})}
                onClose={() => setResourcesPromptedToDelete([])}
                mainContent={
                  <div>
                    {
                      actualResourcesPromptedToDelete.length !== resourcesPromptedToDelete.length &&
                      <p>
                        {
                          translate('{x} of {y} of the resources you selected cannot be deleted now because they are used by another author.', {x: resourcesPromptedToDelete.length - actualResourcesPromptedToDelete.length, y: resourcesPromptedToDelete.length})
                        }
                      </p>
                    }
                    {endangeredContextualizationsLength > 0 &&
                      <p>{
                        t([
                          'You will destroy one item mention in your content if you delete these items.',
                          'You will destroy {n} item mentions in your content if your delete these items.',
                          'n'
                          ],
                        {n: endangeredContextualizationsLength})}
                      </p>
                    }
                    <p>
                      {translate(['Are you sure you want to delete this item ?', 'Are you sure you want to delete these items ?', 'n'], {n: resourcesPromptedToDelete.length})}
                    </p>
                  </div>
                }
                footerContent={[
                  <Button
                    type="submit"
                    isFullWidth
                    key={0}
                    onClick={onDeleteResourcesPromptedToDelete}
                    isColor="danger">{translate('Delete')}</Button>,
                  <Button
                    onClick={() => setResourcesPromptedToDelete([])} isFullWidth key={1}
                    isColor="warning">{translate('Cancel')}</Button>,
                ]} />
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
  }
}

LibraryViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default LibraryViewLayout;
