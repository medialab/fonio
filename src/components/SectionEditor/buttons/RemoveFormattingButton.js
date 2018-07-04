/* eslint react/prop-types: 0 */

import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Image,
} from 'quinoa-design-library/components';

import icons from 'quinoa-design-library/src/themes/millet/icons';


const RemoveFormattingButton = (props, {
  removeFormattingForSelection
}) => {
  const onClick = e => {
    e.preventDefault();
    e.stopPropagation();
    removeFormattingForSelection();
  };
  return (
    <Button
      data-tip={props.tooltip}
      data-for="style-button"
      onMouseDown={onClick}>
      <Image isSize={'24x24'} src={icons.remove.black.svg} />
    </Button>
  );
};


RemoveFormattingButton.contextTypes = {
  removeFormattingForSelection: PropTypes.func,
};

export default RemoveFormattingButton;
