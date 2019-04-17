/**
 * This module provides a component for displaying filters and search input in resources list
 * @module fonio/features/LibraryView
 */

/**
 * Imports Libraries
 */
import React from 'react';
import {
  Level,
  LevelItem,
  LevelLeft,
  LevelRight,
  Field,
  Image,
  Input,
  Dropdown,
  Button,
  FlexContainer,
} from 'quinoa-design-library/components';
import icons from 'quinoa-design-library/src/themes/millet/icons';

const LibraryFiltersBar = ( {
  filterValues,
  onDeleteSelection,
  onDeselectAllVisibleResources,
  onSearchStringChange,
  onSelectAllVisibleResources,
  onToggleOptionsVisibility,
  optionsVisible,
  resourceTypes,
  searchString,
  selectedResourcesIds,
  onFilterChange,
  sortValue,
  statusFilterValue,
  statusFilterValues,
  translate,
  visibleResources,
} ) => (
  <Level
    isMobile
    style={ { flexFlow: 'row wrap' } }
  >
    <LevelLeft>
      <Field hasAddons>
        <Input
          value={ searchString }
          onChange={ onSearchStringChange }
          placeholder={ translate( 'Find a resource' ) }
          style={ { paddingTop: '1.3rem' } }
        />
      </Field>
      <LevelItem>
        <Dropdown
          closeOnChange={ false }
          menuAlign={ 'left' }
          onToggle={ onToggleOptionsVisibility }
          onChange={ onFilterChange }
          isActive={ optionsVisible }
          isColor={ Object.keys( filterValues ).filter( ( f ) => filterValues[f] ).length > 0 ? 'info' : '' }
          value={ {
            sort: {
              value: sortValue,
            },
            filter: {
              value: Object.keys( filterValues ).filter( ( f ) => filterValues[f] ),
            },
            status: {
              value: statusFilterValue,
            }
          } }
          options={
            [
            {
              label: translate( 'Sort items by' ),
              id: 'sort',
              options: [
                {
                  id: 'edited recently',
                  label: translate( 'edited recently' )
                },
                {
                  id: 'title',
                  label: translate( 'title' )
                },
              ]
            },
            {
              label: translate( 'Show items of type' ),
              id: 'filter',
              options: resourceTypes.map( ( type ) => ( {
                id: type,
                label: (
                  <FlexContainer
                    flexDirection={ 'row' }
                    alignItems={ 'center' }
                  >
                    <Image
                      style={ { display: 'inline-block', marginRight: '1em' } }
                      isSize={ '16x16' }
                      src={ icons[type].black.svg }
                    />
                    <span>
                      {translate( type )}
                    </span>
                  </FlexContainer>
                )
              } ) ),
            },
            {
              label: translate( 'Show ...' ),
              id: 'status',
              options: statusFilterValues.map( ( type ) => ( {
                id: type.id,
                label: type.label
              } ) ),
            }
          ]
        }
        >
          {translate( 'Filters' )}
        </Dropdown>
      </LevelItem>
    </LevelLeft>
    <LevelRight>
      <LevelItem>
        <Button
          onClick={ onSelectAllVisibleResources }
          isDisabled={ selectedResourcesIds.length === visibleResources.length }
        >
          {translate( 'Select all' )} ({visibleResources.length})
        </Button>
      </LevelItem>
      <LevelItem>
        <Button
          onClick={ onDeselectAllVisibleResources }
          isDisabled={ selectedResourcesIds.length === 0 }
        >
          {translate( 'Deselect all' )}
        </Button>
      </LevelItem>
      <LevelItem>
        <Button
          isColor={ 'danger' }
          onClick={ onDeleteSelection }
          isDisabled={ selectedResourcesIds.length === 0 }
        >
          {translate( 'Delete selection' )}
        </Button>
      </LevelItem>
    </LevelRight>
  </Level>
);

export default LibraryFiltersBar;
