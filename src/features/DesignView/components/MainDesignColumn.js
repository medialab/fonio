import React from 'react';
import StoryPlayer from 'quinoa-story-player';

import {
  Column,
} from 'quinoa-design-library/components/';


const MainDesignColumn = ({
  story
}) => {


  return (
    <Column isSize={'fullwidth'} style={{position: 'relative'}}>
      <StoryPlayer story={story} />
    </Column>
  );
};


export default MainDesignColumn;
