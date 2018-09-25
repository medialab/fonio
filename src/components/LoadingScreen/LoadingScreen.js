import React from 'react';
import PropTypes from 'prop-types';

import { translateNameSpacer } from '../../helpers/translateUtils';

const wrapper = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'center',
};
const container = {
  display: 'flex',
  flexFlow: 'column nowrap',
  justifyContent: 'center'
};

const LoadingScreen = ( {}, { t } ) => {
  const translate = translateNameSpacer( t, 'Components.LoadingScreen' );
  return (
    <div style={ wrapper }>
      <div style={ container }>
        <div>{translate( 'loading...' )}</div>
      </div>
    </div>
  );
};

LoadingScreen.contextTypes = {
  t: PropTypes.func.isRequired
};

export default LoadingScreen;
