/* eslint react/prefer-stateless-function : 0 */
import React, { Component } from 'react';

import StoryCard from './StoryCard';

import {
  Level,
  Column
} from 'quinoa-design-library/components/';

export default class StoryCardWrapper extends Component {
  render = () => {
    const {
      story,
      users,
      onAction: handleAction,
      onClick: handleClick,
    } = this.props;
    return (
      <Level>
        <Column>
          <StoryCard
            story={ story }
            users={ users }
            onClick={ handleClick }
            onAction={ handleAction }
          />
        </Column>
      </Level>
    );
  }
}
