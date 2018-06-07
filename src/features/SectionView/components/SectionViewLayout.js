import React from 'react';
import PropTypes from 'prop-types';

import EditionUiWrapper from '../../EditionUiWrapper/components/EditionUiWrapperContainer';

import {translateNameSpacer} from '../../../helpers/translateUtils';


const SectionViewLayout = ({
}, {
  t
}) => {
  const translate = translateNameSpacer(t, 'Features.SectionView');

  return (
    <EditionUiWrapper>
      Section view
    </EditionUiWrapper>
  );
};

SectionViewLayout.contextTypes = {
  t: PropTypes.func,
};

export default SectionViewLayout;
