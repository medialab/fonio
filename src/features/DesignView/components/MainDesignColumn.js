import React from 'react';
import StoryPlayer from 'quinoa-story-player';

import {
  Column,
} from 'quinoa-design-library/components/';

import {processCustomCss} from '../../../helpers/postcss';


const MainDesignColumn = ({
  story,
  lang
}) => {


  return (
    <Column isSize={'fullwidth'} style={{position: 'relative'}}>
      <StoryPlayer
        locale={lang}
        story={{
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
