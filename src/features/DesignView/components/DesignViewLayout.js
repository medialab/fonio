import React from 'react';

import {
  Columns
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
  return (<div>
    <Columns isFullHeight>
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
        }
    </Columns>
  </div>);
};
export default DesignViewLayout;
