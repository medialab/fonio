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
  reverseSectionLockMap
}) =>
  (
    <Level>
      <Column>
        <SectionCard
          section={section}
          goTo={goToSection}
          onDelete={onDelete}
          lockData={reverseSectionLockMap[section.id]} />
      </Column>
    </Level>
  )
);


const SortableSectionsList = SortableContainer(({
  items, ...props
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
