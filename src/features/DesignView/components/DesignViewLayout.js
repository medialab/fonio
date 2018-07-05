import React from 'react';

import {
  StretchedLayoutContainer,
} from 'quinoa-design-library/components';

import AsideDesignColumn from './AsideDesignColumn';
import MainDesignColumn from './MainDesignColumn';

const DesignViewLayout = ({
  asideTabMode,
  asideTabCollapsed,
  editedStory: story,
  actions: {
    setAsideTabMode,
    setAsideTabCollapsed,
  },
  onUpdateCss,
  onUpdateSettings,
}) => {
  return (
    <StretchedLayoutContainer isDirection="horizontal" isAbsolute>
      <AsideDesignColumn
        story={story}
        asideTabCollapsed={asideTabCollapsed}
        asideTabMode={asideTabMode}

        setAsideTabMode={setAsideTabMode}
        setAsideTabCollapsed={setAsideTabCollapsed}
        onUpdateCss={onUpdateCss}
        onUpdateSettings={onUpdateSettings} />

      <MainDesignColumn
        story={story} />
    </StretchedLayoutContainer>);
};
export default DesignViewLayout;
