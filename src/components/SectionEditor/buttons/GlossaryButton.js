/**
 * This module provides a toolbar button for link modifier
 * @module fonio/components/SectionEditor
 */
/* eslint react/prop-types: 0 */

import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Image,
} from 'quinoa-design-library/components';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import { silentEvent } from '../../../helpers/misc';

const GlossaryButton = ( { tooltip }, {
  // startNewResourceConfiguration,
  setGlossaryModalFocusData,
  editorFocus
} ) => {
  const onClick = ( e ) => {
    silentEvent( e );
    setGlossaryModalFocusData( editorFocus );
  };
  return (
    <Button
      data-tip={ tooltip }
      data-for={ 'style-button' }
      onMouseDown={ onClick }
    >
      <Image
        style={ { marginLeft: 0, marginRight: 0 } }
        isSize={ '24x24' }
        src={ icons.glossary.black.svg }
      />
    </Button>
  );
};

GlossaryButton.contextTypes = {
  setGlossaryModalFocusData: PropTypes.func,
  editorFocus: PropTypes.string,
  // startNewResourceConfiguration: PropTypes.func,
};

export default GlossaryButton;
