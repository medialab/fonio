/**
 * This module provides a sortable sections cards list
 * @module fonio/features/SummaryView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import FlipMove from 'react-flip-move';
import {
  Level,
  Column,
} from 'quinoa-design-library/components/';

/**
 * Imports Components
 */
import SectionCard from './SectionCard';

const SortableItem = SortableElement( ( {
  value: section,
  story,
  goToSection,
  onDelete,
  setSectionLevel,
  reverseSectionLockMap = {},
  isSorting,
  sectionIndex,
  // sectionIndex,
  maxSectionIndex,
  setSectionIndex,
} ) => {
    return (
      <Level style={ { marginBottom: 0 } }>
        <Column
          isSize={ 12 - section.metadata.level }
          isOffset={ section.metadata.level }
        >
          <SectionCard
            section={ section }
            minified={ isSorting }
            sectionIndex={ sectionIndex }
            maxSectionIndex={ maxSectionIndex }
            goTo={ goToSection }
            story={ story }
            onDelete={ onDelete }
            setSectionIndex={ setSectionIndex }
            setSectionLevel={ setSectionLevel }
            lockData={ reverseSectionLockMap[section.id] }
          />
        </Column>
      </Level>
    );
  }
);

const SortableSectionsList = SortableContainer( ( {
  items,
  ...props
} ) => {
  return (
    <FlipMove>
      {items
        .map( ( section, index ) => {
          return ( <SortableItem
            { ...props }
            key={ section.id/*`item-${index}`*/ }
            maxSectionIndex={ items.length - 1 }
            sectionIndex={ index }
            index={ index }
            value={ section }
                   /> );
        }
      )}
    </FlipMove>
  );
} );

export default SortableSectionsList;
