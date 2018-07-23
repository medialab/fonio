import React from 'react';
import StoryPlayer from 'quinoa-story-player';

import {
  Column,
} from 'quinoa-design-library/components/';

import {processCustomCss} from '../../../helpers/postcss';


const MainDesignColumn = ({
  story
}) => {


  return (
    <Column isSize={'fullwidth'} style={{position: 'relative'}}>
      <StoryPlayer story={{
          ...story,
          settings: {
            ...story.settings,
            css: processCustomCss(story.settings.css)
          }
        }} />
    </Column>
  );
};


export default MainDesignColumn;
