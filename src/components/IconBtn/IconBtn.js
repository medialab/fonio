import React, {Component} from 'react';

import {
  Button,
  Image,
} from 'quinoa-design-library/';

export default class IconBtn extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render = () => {
    const {
      isColor,
      onClick,
      src,
      dataTip,
      ...otherProps
    } = this.props;

    const bindRef = element => {
      this.element = element;
    };

    return (
      <span
        ref={bindRef}>
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
          }} isSize={'32x32'} src={src} />
        </Button>
      </span>
    );

  }
}

