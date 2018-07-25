/* eslint react/prop-types: 0 */

import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Image,
  Columns,
  Column
} from 'quinoa-design-library/components';

import icons from 'quinoa-design-library/src/themes/millet/icons';


import {translateNameSpacer} from '../../../helpers/translateUtils';

const LinkButton = ({tooltip}, {
  startNewResourceConfiguration,
  t
}) => {
  const translate = translateNameSpacer(t, 'Component.LinkButton');
  const onClick = e => {
    e.preventDefault();
    e.stopPropagation();
    startNewResourceConfiguration(true, 'webpage');
  };
  return (
    <Button 
    data-tip={tooltip}
    data-for="style-button"
    onMouseDown={onClick}>
      <Image style={{marginLeft: 0, marginRight: 0}} isSize={'24x24'} src={icons.webpage.black.svg} />
    </Button>
  );
};


LinkButton.contextTypes = {
  startNewResourceConfiguration: PropTypes.func,
  t: PropTypes.func,
};

export default LinkButton;
