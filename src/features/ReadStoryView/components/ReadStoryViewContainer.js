/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'axios';
import icons from 'quinoa-design-library/src/themes/millet/icons';
import {
  AbsoluteContainer,
  FlexContainer,
  Button,
  Icon,
} from 'quinoa-design-library/components';
import StoryPlayer from 'quinoa-story-player';
import { Link } from 'react-router-dom';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
import DataUrlProvider from '../../../components/DataUrlProvider';

/**
 * Imports Assets
 */
import config from '../../../config';

const HomeBtn = () => (
  <Button
    isRounded
    style={ {
      position: 'fixed',
      bottom: '1rem',
      right: '1rem'
    } }
  >
    <Link
      style={ { color: 'black' } }
      to={ '/' }
    >
      <Icon icon={ 'home' } />
    </Link>
  </Button>
);

const Centered = ( { children } ) => (
  <AbsoluteContainer>
    <FlexContainer
      style={ { height: '100%' } }
      flexDirection={ 'row' }
      alignItems={ 'center' }
    >
      <FlexContainer
        style={ { flex: 1 } }
        alignItems={ 'center' }
        flexDirection={ 'column' }
      >
        <img
          style={ { height: '2rem' } }
          src={ icons.fonioBrand.svg }
        />
        {children}
      </FlexContainer>
    </FlexContainer>
  </AbsoluteContainer>
);

class ReadStoryViewContainer extends Component {

  static contextTypes = {
    t: PropTypes.func,
  }

  constructor( props ) {
    super( props );
    this.state = {
      status: 'loading',
      story: undefined,
    };
  }

  componentWillMount = () => {
    const {
      match: {
        params: {
          storyId
        }
      },
    } = this.props;

    get( `${config.restUrl}/stories/${storyId}?edit=false` )
      .then( ( { data } ) => {
        this.setState( {
          story: data,
          status: 'loaded'
        } );
      } )
      .catch( ( error ) => {
        this.setState( {
          status: 'error',
          error
        } );
      } );
  }

  shouldComponentUpdate = () => true;

  render() {
    const {
      status,
      story
    } = this.state;

    const translate = translateNameSpacer( this.context.t, 'Features.ReadOnly' );
    switch ( status ) {
      case 'loaded':
        return (
          <DataUrlProvider
            storyId={ story.id }
            serverUrl={ config.apiUrl }
          >
            <StoryPlayer story={ story } />
            <HomeBtn />
          </DataUrlProvider>
          );
      case 'error':
        return <Centered>{translate( 'Story not found' )}</Centered>;
      case 'loading':
        default:
        return <Centered>{translate( 'Loading' )}</Centered>;
    }
  }
}

export default ReadStoryViewContainer;
