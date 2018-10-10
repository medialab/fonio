/**
 * This module provides a connected component for handling the design view
 * @module fonio/features/DesignView
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import {
  withRouter,
} from 'react-router';
import { toastr } from 'react-redux-toastr';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Ducks
 */
import * as duck from '../duck';
import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as storyDuck from '../../StoryManager/duck';
import * as editionUiDuck from '../../EditionUiWrapper/duck';

/**
 * Imports Components
 */
import DesignViewLayout from './DesignViewLayout';
import EditionUiWrapper from '../../EditionUiWrapper/components';
import DataUrlProvider from '../../../components/DataUrlProvider';

/**
 * Imports Assets
 */
import config from '../../../config';

/**
 * Shared constants
 */
const MEDIUM_TIMEOUT = 500;

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

  static contextTypes = {
    t: PropTypes.func,
  }

  constructor( props ) {
    super( props );
    this.onUpdateCss = debounce( this.onUpdateCss, MEDIUM_TIMEOUT );
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
      },
      lockingMap: prevLockingMap
    } = this.props;
    const {
      match: {
        params: {
          storyId: nextStoryId
        }
      },
      lockingMap,
      history,
      userId,
    } = nextProps;
    const { t } = this.context;

    const translate = translateNameSpacer( t, 'Features.DesignView' );

    // if lock is lost (e.g. after idle-then-loose-block usecases) redirect to summary
    if (
        prevLockingMap && prevLockingMap[prevStoryId] &&
        lockingMap && lockingMap[nextStoryId] &&
        prevLockingMap[prevStoryId].locks[userId] && lockingMap[nextStoryId].locks[userId] &&
        prevLockingMap[prevStoryId].locks[userId].design && !lockingMap[nextStoryId].locks[userId].design
      ) {
      history.push( `/story/${nextStoryId}` );
      toastr.error( translate( 'Someone took your place in the design view !' ), translate( 'This happened because you were inactive too much time' ) );
    }

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
