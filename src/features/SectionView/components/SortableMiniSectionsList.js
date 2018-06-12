import React from 'react';

import {SortableContainer, SortableElement} from 'react-sortable-hoc';

import {
  Level,
  Column,
} from 'quinoa-design-library/components/';

import SectionMiniCard from './SectionMiniCard';

const SortableItem = SortableElement(({
  value: section,
  onOpenSettings,
  onDeleteSection,
  storyId,
}) => {
  const handleDelete = () => {
    onDeleteSection(section.id);
  };
  return (
    <Level>
      <Column>
        <SectionMiniCard
          section={section}
          storyId={storyId}
          onDeleteSection={handleDelete}
          onOpenSettings={onOpenSettings} />
      </Column>
    </Level>
  );
});

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