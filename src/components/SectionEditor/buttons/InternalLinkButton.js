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

import icon from '../../../sharedAssets/internal-link.svg';

import { silentEvent } from '../../../helpers/misc';

const InternalLinkButton = ( { tooltip }, {
  // startNewResourceConfiguration,
  setInternalLinkModalFocusData,
  editorFocus
} ) => {
  const onClick = ( e ) => {
    silentEvent( e );
    // startNewResourceConfiguration(true, 'webpage');
    setInternalLinkModalFocusData( editorFocus );
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
        src={ icon }
      />
    </Button>
  );
};

InternalLinkButton.contextTypes = {
  setInternalLinkModalFocusData: PropTypes.func,
  editorFocus: PropTypes.string,
  // startNewResourceConfiguration: PropTypes.func,
};

export default InternalLinkButton;
