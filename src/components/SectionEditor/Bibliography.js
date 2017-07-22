import React from 'react';
import PropTypes from 'prop-types';

import {translateNameSpacer} from '../../helpers/translateUtils';

const Bib = ({

}, {
  bibliography,
  t
}) => {
  const translate = translateNameSpacer(t, 'Components.Bibliography');
  return (
    <section>
      <h2>{translate('bibliography-title')}</h2>
      <div>{bibliography}</div>
    </section>
  );
};

Bib.contextTypes = {
  bibliography: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]),
  lang: PropTypes.string,
  t: PropTypes.func
};

export default Bib;
