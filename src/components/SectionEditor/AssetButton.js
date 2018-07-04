import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Image
} from 'quinoa-design-library/components';

import {translateNameSpacer} from '../../helpers/translateUtils';

import icons from 'quinoa-design-library/src/themes/millet/icons';

const AssetButton = ({
  onClick,
  active
}, {t}) => {
  const translate = translateNameSpacer(t, 'Component.SectionEditor');
  const onMouseDown = event => event.preventDefault();

  return (
    <Button
      isRounded
      isColor={active && 'info'}
      onMouseDown={onMouseDown}
      onClick={onClick}
      data-tip={translate('add an element from your library')}>
      <Image isSize={'16x16'} src={icons.asset.black.svg} />
    </Button>
  );
};

AssetButton.contextTypes = {
  t: PropTypes.func
};

export default AssetButton;
