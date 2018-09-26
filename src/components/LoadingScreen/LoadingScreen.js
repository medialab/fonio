/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  AbsoluteContainer,
  FlexContainer,
} from 'quinoa-design-library/components';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';

const LoadingScreen = ( {}, { t } ) => {
  const translate = translateNameSpacer( t, 'Components.LoadingScreen' );
  return (
    <AbsoluteContainer>
      <FlexContainer
        style={ { height: '100%' } }
        flexDirection={ 'row' }
        alignItems={ 'center' }
      >
        <FlexContainer
          style={ { flex: 1 } }
          alignItems={ 'center' }
          flexDirection={ 'column' }
        >
          <div>{translate( 'loading...' )}</div>
        </FlexContainer>
      </FlexContainer>
    </AbsoluteContainer>
  );
};

LoadingScreen.contextTypes = {
  t: PropTypes.func.isRequired
};

export default LoadingScreen;
