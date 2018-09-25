import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { debounce } from 'lodash';
import {
  withRouter,
} from 'react-router';

import config from '../../../config';

import * as duck from '../duck';

import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as storyDuck from '../../StoryManager/duck';
import * as editionUiDuck from '../../EditionUiWrapper/duck';

import DesignViewLayout from './DesignViewLayout';

import EditionUiWrapper from '../../EditionUiWrapper/components/EditionUiWrapperContainer';
import DataUrlProvider from '../../../components/DataUrlProvider';

@connect(
  ( state ) => ( {
    lang: state.i18nState && state.i18nState.lang,
    ...connectionsDuck.selector( state.connections ),
    ...storyDuck.selector( state.editedStory ),
    ...duck.selector( state.design ),
  } ),
  ( dispatch ) => ( {
    actions: bindActionCreators( {
      ...editionUiDuck,
      ...connectionsDuck,
      ...storyDuck,
      ...duck,
    }, dispatch )
  } )
)

class DesignViewContainer extends Component {

  constructor( props ) {
    super( props );
    this.onUpdateCss = debounce( this.onUpdateCss, 500 );
  }

  componentDidMount = () => {
    // require lock if edited story is here
    if ( this.props.editedStory ) {
      this.requireLockOnDesign( this.props );
    }
  }

  componentWillReceiveProps = ( nextProps ) => {

    /**
     * if section id or story id is changed leave previous section and try to lock on next section
     */
    const {
      match: {
        params: {
          storyId: prevStoryId
        }
      }
    } = this.props;
    const {
      match: {
        params: {
          storyId: nextStoryId
        }
      },
    } = nextProps;

    /**
     * @todo skip this conditional with another strategy relying on components architecture
     */
    if ( !this.props.editedStory && nextProps.editedStory ) {
      this.requireLockOnDesign( this.props );
    }

    if ( prevStoryId !== nextStoryId ) {
      this.requireLockOnDesign( nextProps );
    }
  }

  componentWillUnmount = () => {
    this.onUpdateCss.cancel();
    this.unlockOnDesign( this.props );
    this.props.actions.setCssHelpVisible( false );
    this.props.actions.resetViewsUi();
  }

  unlockOnDesign = ( props ) => {
    const {
      match: {
        params: {
          storyId
        }
      },
      lockingMap,
      userId,
    } = props;
    if ( lockingMap && lockingMap[storyId] && lockingMap[storyId].locks[userId] ) {
      this.props.actions.leaveBlock( {
        storyId,
        userId,
        blockType: 'design',
        blockId: 'design'
      } );
    }
  }

  requireLockOnDesign = ( props ) => {
    const {
      match: {
        params: {
          storyId
        }
      },
      userId
    } = props;
    this.props.actions.enterBlock( {
      storyId,
      userId,
      blockType: 'design',
      blockId: 'design'
    }, ( err ) => {
      if ( err ) {

        /**
         * ENTER_BLOCK_FAIL
         * If section lock is failed/refused,
         * this means another client is editing the section
         * -> for now the UI behaviour is to get back client to the summary view
         */
        this.props.history.push( `/story/${storyId}/` );
      }
      else {

        /*
         * ENTER_BLOCK_SUCCESS
         * this.goToSection(sectionId);
         */
      }
    } );
  }

  onUpdateCss = ( css ) => {
    const {
      editedStory: story,
      userId,
      actions: {
        updateStorySettings
      }
    } = this.props;
    updateStorySettings( {
      storyId: story.id,
      userId,
      settings: {
        ...story.settings,
        css,
      }
    } );
  }

  onUpdateSettings = ( settings ) => {
    const {
      editedStory: story,
      userId,
      actions: {
        updateStorySettings
      }
    } = this.props;
    updateStorySettings( {
      storyId: story.id,
      userId,
      settings,
    } );
  }

  render() {
    const {
      props: {
        editedStory,
      },
      onUpdateCss,
      onUpdateSettings
    } = this;
    if ( editedStory ) {
      return (
        <DataUrlProvider
          storyId={ editedStory.id }
          serverUrl={ config.apiUrl }
        >
          <EditionUiWrapper>
            <DesignViewLayout
              story={ this.props.editedStory }
              onUpdateCss={ onUpdateCss }
              onUpdateSettings={ onUpdateSettings }
              { ...this.props }
            />
          </EditionUiWrapper>
        </DataUrlProvider>
      );
    }
    return null;
  }
}

export default withRouter( DesignViewContainer );
