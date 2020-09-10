/**
 * This module provides a wrapper for story cards as displayed in list within the home view
 * @module fonio/features/HomeView
 */
/* eslint react/prefer-stateless-function : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import {
  Level,
  Column
} from 'quinoa-design-library/components/';

/**
 * Imports Components
 */
import StoryCard from './StoryCard';

export default class StoryCardWrapper extends Component {
  render = () => {
    const {
      story,
      users,
      onAction: handleAction,
      onClick: handleClick,
    } = this.props;
    return (
      <Level style={ { marginBottom: 0 } }>
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
