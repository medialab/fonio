/* eslint react/prop-types: 0 */

import React from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../../helpers/translateUtils';

const LinkButton = (props, {
  startNewResourceConfiguration,
  t
}) => {
  const translate = translateNameSpacer(t, 'Component.LinkButton')
  const onClick = e => {
    e.preventDefault();
    e.stopPropagation();
    startNewResourceConfiguration(true, 'webpage');
  };
  return (
    <button onMouseDown={onClick} className="fonio-LinkButton">
      <span className="button-content">
        <img src={require('../../../sharedAssets/webpage-black.svg')} />
        <span>{translate('add-link')}</span>
      </span>
    </button>
  );
};


LinkButton.contextTypes = {
  startNewResourceConfiguration: PropTypes.func,
  t: PropTypes.func,
};

export default LinkButton;