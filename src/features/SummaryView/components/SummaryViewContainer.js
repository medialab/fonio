/**
 * This module provides a connected component for handling the summary view
 * @module fonio/features/SummaryView
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Imports Ducks
 */
import * as duck from '../duck';
import * as editedStoryDuck from '../../StoryManager/duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as sectionsManagementDuck from '../../SectionsManager/duck';

/**
 * Imports Components
 */
import SummaryViewLayout from './SummaryViewLayout';
import EditionUiWrapper from '../../EditionUiWrapper/components';

@connect(
  ( state ) => ( {
    ...duck.selector( state.summary ),
    ...editedStoryDuck.selector( state.editedStory ),
    ...connectionsDuck.selector( state.connections ),
    ...sectionsManagementDuck.selector( state.sectionsManagement ),
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      ...connectionsDuck,
      ...editedStoryDuck,
      ...sectionsManagementDuck,
      ...duck
    }, dispatch )
  } )
)
class SummaryViewContainer extends Component {

  constructor( props ) {
    super( props );
  }

  componentWillMount = () => {
    const {
      match: {
        params: {
          storyId
        }
      },
      userId
    } = this.props;
    this.props.actions.enterBlock( {
      storyId,
      userId,
      blockType: 'summary',
      blockId: 'summary',
      noLock: true
    } );
  }

  shouldComponentUpdate = () => true;

  componentWillUnmount = () => {

    /**
     * Leave metadata if it was locked
     */
    const {
      lockingMap,
      userId,
      editedStory = {},
      actions: {
        leaveBlock
      }
    } = this.props;
    const { id: storyId } = editedStory;
    const userLockedOnMetadataId = lockingMap[storyId] && lockingMap[storyId].locks &&
      Object.keys( lockingMap[storyId].locks )
        .find( ( thatUserId ) => lockingMap[storyId].locks[thatUserId].storyMetadata !== undefined );
    if ( userLockedOnMetadataId && userLockedOnMetadataId === userId ) {
      leaveBlock( {
        storyId,
        userId,
        blockType: 'storyMetadata',
        blockId: 'storyMetadata',
      } );
    }

    this.props.actions.leaveBlock( {
      storyId,
      userId,
      blockType: 'summary',
      blockId: 'summary',
      noLock: true
    } );
  }

  goToSection = ( sectionId ) => {
    const {
      editedStory: {
        id
      }
    } = this.props;
    this.props.history.push( `/story/${id}/section/${sectionId}` );
  }

  render() {
    return this.props.editedStory ?
          (
            <EditionUiWrapper>
              <SummaryViewLayout
                { ...this.props }
                goToSection={ this.goToSection }
              />
            </EditionUiWrapper>
          )
          : null;
  }
}

export default SummaryViewContainer;
