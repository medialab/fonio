import React from 'react';

import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import {List, AutoSizer} from 'react-virtualized';
import ReactTooltip from 'react-tooltip';

import {
  Level,
  Column,
} from 'quinoa-design-library/components/';

import SectionMiniCard from './SectionMiniCard';


const SortableItem = SortableElement(({
  value: section,
  onOpenSettings,
  onDeleteSection,
  setSectionLevel,
  storyId,
}) => {
  const handleDelete = () => {
    onDeleteSection(section.id);
  };
  return (
    <Level>
      <Column isSize={12 - section.metadata.level} isOffset={section.metadata.level} >
        <SectionMiniCard
          section={section}
          setSectionLevel={setSectionLevel}
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
  const rowRenderer = ({
    key,
    style,
    index,
  }) => {
    return (
      <div key={key} style={style}>
        <SortableItem
          {...props}
          index={index}
          value={items[index]} />
      </div>
    );
  };
  return (
    <AutoSizer>
      {({width, height}) => (
        <List
          height={height}
          rowCount={items.length}
          rowHeight={200}
          rowRenderer={rowRenderer}
          width={width}
          onRowsRendered={() =>
            ReactTooltip.rebuild()
          } />
      )}
    </AutoSizer>
  );
});

export default SortableSectionsList;
