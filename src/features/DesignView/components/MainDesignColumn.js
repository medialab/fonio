import React from 'react';
import StoryPlayer from 'quinoa-story-player';

import {
  Column,
  Content,
} from 'quinoa-design-library/components/';

import {processCustomCss} from '../../../helpers/postcss';


const MainDesignColumn = ({
  story
}) => {


  return (
    <Column isSize={'fullwidth'} style={{position: 'relative'}}>
      <Content>
        <StoryPlayer story={{
          ...story,
          settings: {
            ...story.settings,
            css: processCustomCss(story.settings.css)
          }
        }} />
      </Content>
    </Column>
  );
};


export default MainDesignColumn;
