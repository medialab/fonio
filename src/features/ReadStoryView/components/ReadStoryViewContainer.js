/**
 * This module provides a connected component for handling the read story view
 * @module fonio/features/ReadStory
 */
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome';
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint';
import Frame, { FrameContextConsumer } from 'react-frame-component';

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
      <Icon>
        <FontAwesomeIcon icon={ faHome } />
      </Icon>
    </Link>
  </Button>
);
const PrintBtn = ({onClick}) => (
  <Button
    isRounded
    style={ {
      position: 'fixed',
      bottom: '1rem',
      right: '4rem'
    } }
    onClick={onClick}
  >
      <Icon>
        <FontAwesomeIcon icon={ faPrint } />
      </Icon>
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

    const search = this.props.location.search;
    const query = search && search.substr( 1 ).split( '&' ).map( ( item ) => item.split( '=' ) );
    const langParam = query && query.find( ( tuple ) => tuple[0] === 'lang' );
    const lang = langParam ? langParam[1] : 'en';

    const handlePrint = () => {
      window.frames.read.focus();
    window.frames.read.print();
    }

    const translate = translateNameSpacer( this.context.t, 'Features.ReadOnly' );
    switch ( status ) {
      case 'loaded':
        return (
          <div>
            <Frame
              head={
                <style>
                  {'@import url(\'https://fonts.googleapis.com/css?family=Merriweather:400,400i,700,700i|Roboto:400,400i,700,700i,900\')'}
                </style>
            }
              name={ 'read' }
              id={ 'read' }
              style={ { width: '100%', height: '100%', position: 'absolute', left: 0, top: 0 } }
            >
              <FrameContextConsumer>
                {( { document, window } ) => (
                  <DataUrlProvider
                    storyId={ story.id }
                    serverUrl={ config.apiUrl }
                  >
                    <StoryPlayer
                      locale={ lang }
                      story={ story }
                      usedDocument={ document }
                      usedWindow={ window }
                    />
                  </DataUrlProvider>
          )}
              </FrameContextConsumer>
            </Frame>

            <HomeBtn />
            <PrintBtn onClick={handlePrint} />
          </div>

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
