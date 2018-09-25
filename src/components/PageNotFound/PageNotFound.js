import React from 'react';
import PropTypes from 'prop-types';

import { translateNameSpacer } from '../../helpers/translateUtils';

import {
  Link,
} from 'react-router-dom';

import {
  ModalCard
} from 'quinoa-design-library/components';

const PageNotFound = ( {
  pathName
}, { t } ) => {
  const translate = translateNameSpacer( t, 'Components.PageNotFound' );

  return (
    <ModalCard
      isActive
      headerContent={ translate( 'Fonio - page not found' ) }
      mainContent={
        <p>
          {translate( 'No match for {u}, go back to ', { u: pathName } )}
          <Link to={ '/' }>
            {translate( 'home page' )}
          </Link>
        </p>
      }
    />
  );
};

PageNotFound.contextTypes = {
  t: PropTypes.func
};

export default PageNotFound;
