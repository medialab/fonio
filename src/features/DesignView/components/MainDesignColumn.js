/**
 * This module provides a layout component for displaying design view main column layout
 * @module fonio/features/DesignView
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StoryPlayer from 'quinoa-story-player';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import { set } from 'lodash/fp';
import {
  Column,
  Button,
} from 'quinoa-design-library/components/';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint';
import { getTemplateName, isNewSchema, getStyles } from 'quinoa-schemas';

/**
 * Imports Project utils
 */
import { processCustomCss } from '../../../helpers/postcss';

class ContextProvider extends Component {

  static childContextTypes = {
    getResourceDataUrl: PropTypes.func
  }

  getChildContext = () => ( {
    getResourceDataUrl: this.props.getResourceDataUrl,
  } )
  render = () => {
    return this.props.children;
  }
}

const PreviewWrapper = ( props, context ) => {
  const { getResourceDataUrl } = context;
  const { story, lang } = props;
  const renderedStory = set(
    isNewSchema( story ) ? [
      'settings',
      'styles',
      getTemplateName( story ),
      'css'
    ] : [
      'settings',
      'css'
    ],
    processCustomCss( getStyles( story ).css ),
    story
  );
  return (
    <Frame
      head={
        <style>
          {'@import url(\'https://fonts.googleapis.com/css?family=Merriweather:400,400i,700,700i|Roboto:400,400i,700,700i,900\')'}
        </style>
      }
      name={ 'preview' }
      id={ 'preview' }
      style={ { width: '100%', height: '100%' } }
    >
      <FrameContextConsumer>
        {( { document, window } ) => (
          <ContextProvider getResourceDataUrl={ getResourceDataUrl }>
            <StoryPlayer
              locale={ lang }
              story={ renderedStory }
              usedDocument={ document }
              usedWindow={ window }
            />
          </ContextProvider>
        )}
      </FrameContextConsumer>
    </Frame>
  );
};

PreviewWrapper.contextTypes = {
  getResourceDataUrl: PropTypes.func
};

const MainDesignColumn = ( {
  story,
  lang
} ) => {

  const handleClickOnPrint = () => {
    window.frames.preview.focus();
    window.frames.preview.print();
  };

  return (
    <Column
      isSize={ 'fullwidth' }
      style={ { position: 'relative' } }
    >
      {
        <PreviewWrapper
          story={ story }
          lang={ lang }
        />
      }
      <Button
        style={ {
          position: 'absolute',
          right: '1rem',
          bottom: '1rem'
        } }
        className={ 'is-rounded' }
        onClick={ handleClickOnPrint }
      >
        <FontAwesomeIcon icon={ faPrint } />
      </Button>
    </Column>
  );
};

export default MainDesignColumn;
