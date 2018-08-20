import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../helpers/translateUtils';

import IconBtn from '../IconBtn';

import icons from 'quinoa-design-library/src/themes/millet/icons';


class AssetButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render = () => {
    const {
      props: {
        onClick,
        active,
        icon
      },
      context: {t}
    } = this;
    const translate = translateNameSpacer(t, 'Components.SectionEditor');
    const onMouseDown = event => event.preventDefault();

    // const bindRef = element => {
    //   this.element = element;
    // }

    // return (
    //   <div ref={bindRef}>
    //     test
    //   </div>
    // )

    const bindRef = btn => {
      if (btn) {
        this.element = btn.element;
      }
    };
    return (
      <IconBtn
        isColor={active && 'warning'}
        onMouseDown={onMouseDown}
        onClick={onClick}
        ref={bindRef}
        dataTip={translate('add an element from your library (shortcut : cmd + l)')}
        src={icon || icons.asset.black.svg} />
    );
  }
}

AssetButton.contextTypes = {
  t: PropTypes.func
};

export default AssetButton;
