import React from 'react';

import {
  Button,
  Image,
} from 'quinoa-design-library/';


export default ({
  isColor,
  onClick,
  src,
  dataTip,
  ...otherProps
}) => (
  <Button
    data-tip={dataTip}
    data-for="icon-btn-tooltip"
    data-effect="solid"
    data-place="top"
    isColor={isColor}
    isRounded
    onClick={onClick}
    style={{overflow: 'visible'}}
    {...otherProps}>
    <span style={{opacity: 0}}>o</span>
    <Image
      style={{
        margin: 0,
        display: 'flex',
        flexFlow: 'column nowrap',
        justifyContent: 'center',
        position: 'absolute'
      }} isSize={'16x16'} src={src} />
  </Button>
  );
