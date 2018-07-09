import React from 'react';

import {
  StretchedLayoutContainer,
} from 'quinoa-design-library/components';

import AsideDesignColumn from './AsideDesignColumn';
import MainDesignColumn from './MainDesignColumn';

const DesignViewLayout = ({
  designAsideTabMode,
  designAsideTabCollapsed,
  editedStory: story,
  actions: {
    setDesignAsideTabMode,
    setDesignAsideTabCollapsed,
  },
  onUpdateCss,
  onUpdateSettings,
}) => {
  return (
    <StretchedLayoutContainer isDirection="horizontal" isAbsolute>
      <AsideDesignColumn
        story={story}
        designAsideTabCollapsed={designAsideTabCollapsed}
        designAsideTabMode={designAsideTabMode}
        style={{minWidth: designAsideTabCollapsed ? undefined : '30%'}}

        setDesignAsideTabMode={setDesignAsideTabMode}
        setDesignAsideTabCollapsed={setDesignAsideTabCollapsed}
        onUpdateCss={onUpdateCss}
        onUpdateSettings={onUpdateSettings} />

      <MainDesignColumn
        story={story} />
    </StretchedLayoutContainer>);
};
export default DesignViewLayout;
