import React from 'react';

import {SortableContainer, SortableElement} from 'react-sortable-hoc';

import {
  Level,
  Column,
} from 'quinoa-design-library/components/';

import SectionCard from './SectionCard';

const SortableItem = SortableElement(({
  value: section,
  goToSection,
  onDelete,
  setSectionLevel,
  reverseSectionLockMap = {},
  isSorting,
}) => {
    return (
      <Level>
        <Column isSize={12 - section.metadata.level} isOffset={section.metadata.level}>
          <SectionCard
            section={section}
            minified={isSorting}
            goTo={goToSection}
            onDelete={onDelete}
            setSectionLevel={setSectionLevel}
            lockData={reverseSectionLockMap[section.id]} />
        </Column>
      </Level>
    );
  }
);


const SortableSectionsList = SortableContainer(({
  items,
  ...props
}) => {
  return (
    <ul>
      {items
        .map((section, index) => (
          <SortableItem
            {...props} key={`item-${index}`} index={index}
            value={section} />
      ))}
    </ul>
  );
});

export default SortableSectionsList;
