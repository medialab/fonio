import React, {Component} from 'react';
import PropTypes from 'prop-types';

import resourceSchema from 'quinoa-schemas/resource';

import {
  Button,
  Column,
  Control,
  Dropdown,
  // DropZone,
  Field,
  Input,
  HelpPin,
  Level,
  Image,
  Tab,
  TabLink,
  TabList,
  Tabs,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import ResourcesList from './ResourcesList';
import SortableMiniSectionsList from './SortableMiniSectionsList';

const resourceTypes = Object.keys(resourceSchema.definitions);

class AsideSectionColumn extends Component {

  shouldComponentUpdate = nextProps => {
    const changingProps = [
      'asideTabCollapsed',
      'asideTabMode',
      'resourceOptionsVisible',
      'mainColumnMode',
      'activeUsers',
      'lockMap',
      'userLockedResourceId',
      'sections',

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
      resourceOptionsVisible,
      mainColumnMode,
      story,

      getResourceTitle,
      sections,

      userId,

      reverseResourcesLockMap,
      userLockedResourceId,

      setAsideTabCollapsed,
      setAsideTabMode,
      setResourceOptionsVisible,
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
      onSetCoverImage,
      // submitMultiResources,

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
          const setOption = (option, optionDomain) => {
            if (optionDomain === 'filter') {
              toggleResourceFilter(option);
            }
            else if (optionDomain === 'sort') {
              setResourceSortValue(option);
            }
          };
          return (
            <StretchedLayoutContainer isFluid isAbsolute>
              <StretchedLayoutItem>
                <div>
                  <Column>
                    <Field hasAddons>
                      <Control style={{flex: 1}}>
                        <Input value={resourceSearchString} onChange={e => setResourceSearchString(e.target.value)} placeholder={translate('find a resource')} />
                      </Control>
                      <Control>
                        <Dropdown
                          closeOnChange={false}
                          menuAlign={'right'}
                          onToggle={() => {
                          setResourceOptionsVisible(!resourceOptionsVisible);
                        }}
                          onChange={setOption}
                          isActive={resourceOptionsVisible}
                          value={{
                          sort: {
                            value: resourceSortValue,
                          },
                          filter: {
                            value: Object.keys(resourceFilterValues).filter(f => resourceFilterValues[f]),
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
                            label: translate('Show ...'),
                            id: 'filter',
                            options: resourceTypes.map(type => ({
                              id: type,
                              label: <span><Image style={{display: 'inline-block'}} isSize={'16x16'} src={icons[type].black.svg} /><span>{translate(type)}</span></span>
                            })),
                          }
                        ]}>
                          {translate('Options')}
                        </Dropdown>
                      </Control>
                    </Field>
                  </Column>
                </div>
              </StretchedLayoutItem>
              <StretchedLayoutItem isFlex={1} isFlowing>
                <Column>
                  <ResourcesList
                    resources={visibleResources}
                    onDeleteResource={onDeleteResource}
                    onSetCoverImage={onSetCoverImage}
                    storyId={storyId}
                    userId={userId}
                    onResourceEditAttempt={onResourceEditAttempt}
                    reverseResourcesLockMap={reverseResourcesLockMap}
                    getResourceTitle={getResourceTitle}
                    userLockedResourceId={userLockedResourceId} />
                </Column>
                {/*<Level>
                  <DropZone onDrop={submitMultiResources}>
                    {translate('Drop files to include new resources in your library (images, tables, bibliographies)')}
                  </DropZone>
                </Level>*/}
              </StretchedLayoutItem>
              <StretchedLayoutItem>
                <Level>
                  <Column>
                    <Button
                      isFullWidth
                      onClick={() => setMainColumnMode(mainColumnMode === 'newresource' ? 'edition' : 'newresource')}
                      isColor={mainColumnMode === 'newresource' ? 'primary' : 'info'}
                      isDisabled={userLockedResourceId !== undefined}>
                      <span style={{paddingRight: '1rem'}}>{translate('Add items to library')}</span> <HelpPin place="right">
                        {translate('Add new images to your story')}
                      </HelpPin>
                    </Button>
                  </Column>
                </Level>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          );
        case 'summary':
        default:
          return (
            <StretchedLayoutContainer isFluid isAbsolute>
              <StretchedLayoutItem isFlex={1} isFlowing>
                <Column>
                  <SortableMiniSectionsList
                    storyId={storyId}
                    items={sections}
                    onSortEnd={onSortEnd}
                    onOpenSettings={thatSection => onOpenSectionSettings(thatSection.id)}
                    onDeleteSection={onDeleteSection}
                    useDragHandle />
                </Column>
              </StretchedLayoutItem>
              <StretchedLayoutItem >
                <Column>
                  <Column>
                    <Button
                      isDisabled={userLockedResourceId !== undefined && mainColumnMode === 'edition'}
                      onClick={() => setMainColumnMode('newsection')} isColor={'primary'} isFullWidth>
                      <span style={{paddingRight: '1rem'}}>{translate('New section')}</span> <HelpPin place="right">
                        {translate('Add a new section or chapter to your story')}
                      </HelpPin>
                    </Button>
                  </Column>
                </Column>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          );
      }
    };
    return (
      <Column isSize={asideTabCollapsed ? 1 : '1/4'}>
        <StretchedLayoutContainer isFluid isAbsolute>
          <StretchedLayoutItem>
            <Column>
              <Tabs isBoxed isFullWidth style={{overflow: 'hidden'}}>
                <Column>
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
                </Column>
              </Tabs>
            </Column>
          </StretchedLayoutItem>
          <StretchedLayoutItem isFlex={1}>
            <Column>
              {renderAside()}
            </Column>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>
      </Column>
    );
  }
}

AsideSectionColumn.contextTypes = {
  t: PropTypes.func,
};

export default AsideSectionColumn;
