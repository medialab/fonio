import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as duck from '../duck';
import * as userInfoDuck from '../../UserInfoManager/duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as editedStoryDuck from '../../StoryManager/duck';

import EditionUiWrapperLayout from './EditionUiWrapperLayout';

@connect(
  ( state ) => ( {
    lang: state.i18nState && state.i18nState.lang,
    ...connectionsDuck.selector( state.connections ),
    ...duck.selector( state.editionUiWrapper ),
    ...userInfoDuck.selector( state.userInfo ),
    ...editedStoryDuck.selector( state.editedStory ),
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {

      ...duck,
      ...userInfoDuck,
      ...connectionsDuck,
    }, dispatch )
  } )
)

class EditionUiWrapperContainer extends Component {

  constructor( props ) {
    super( props );
  }

  getNavLocation = ( path ) => {
    switch ( path ) {
      case '/story/:storyId/library':
        return 'library';
      case '/story/:storyId/design':
        return 'design';
      case '/story/:storyId/section/:sectionId':
        return 'editor';
      case '/story/:storyId/summary':
      case '/story/:storyId':
        return 'summary';
      default:
        return undefined;
    }
  }

  getActiveSectionTitle = ( story, sectionId ) => story.sections[sectionId].metadata.title;

  render() {
    const navLocation = this.getNavLocation( this.props.match.path );
    let activeSectionTitle;
    if ( this.props.match.params.sectionId && this.props.editedStory ) {
      activeSectionTitle = this.getActiveSectionTitle( this.props.editedStory, this.props.match.params.sectionId );
    }
    return (
      <EditionUiWrapperLayout
        { ...this.props }
        activeSectionTitle={ activeSectionTitle }
        sectionId={ this.props.match.params.sectionId }
        navLocation={ navLocation }
      />
    );
  }
}

export default withRouter( EditionUiWrapperContainer );
