import React from 'react';
import StoryPlayer from 'quinoa-story-player';

import {
  Column,
  Content,
} from 'quinoa-design-library/components/';


const MainDesignColumn = ({
  story
}) => {


  return (
    <Column isSize={'fullwidth'} style={{position: 'relative'}}>
      <Content>
        <StoryPlayer story={story} />
      </Content>
    </Column>
  );
};


export default MainDesignColumn;
