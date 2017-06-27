import React from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../helpers/translateUtils';

const Bib = ({

}, {
  bibliography,
  t
}) => {
  // console.log('bibliography', bibliography);
  const translate = translateNameSpacer(t, 'Components.Bibliography');
  return (
    <section>
      <h2>{translate('bibliography-title')}</h2>
      <div>{bibliography}</div>
    </section>
  );
};

Bib.contextTypes = {
  bibliography: PropTypes.object,
  lang: PropTypes.string,
  t: PropTypes.func.required
};

export default Bib;
