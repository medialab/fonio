/* eslint react/prop-types: 0 */

import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Image,
} from 'quinoa-design-library/components';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import { silentEvent } from '../../../helpers/misc';

const LinkButton = ( { tooltip }, {
  // startNewResourceConfiguration,
  setLinkModalFocusData,
  editorFocus
} ) => {
  const onClick = ( e ) => {
    silentEvent( e );
    // startNewResourceConfiguration(true, 'webpage');
    setLinkModalFocusData( editorFocus );
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
        src={ icons.webpage.black.svg }
      />
    </Button>
  );
};

LinkButton.contextTypes = {
  setLinkModalFocusData: PropTypes.func,
  editorFocus: PropTypes.string,
  // startNewResourceConfiguration: PropTypes.func,
};

export default LinkButton;
