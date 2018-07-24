import React from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../helpers/translateUtils';

import IconBtn from '../IconBtn';

import icons from 'quinoa-design-library/src/themes/millet/icons';

const AssetButton = ({
  onClick,
  active,
  icon
}, {t}) => {
  const translate = translateNameSpacer(t, 'Component.SectionEditor');
  const onMouseDown = event => event.preventDefault();

  return (
    <IconBtn
      isColor={active && 'warning'}
      onMouseDown={onMouseDown}
      onClick={onClick}
      dataTip={translate('add an element from your library (shortcut : cmd + l)')}
      src={icon || icons.asset.black.svg} />
  );
};

AssetButton.contextTypes = {
  t: PropTypes.func
};

export default AssetButton;
