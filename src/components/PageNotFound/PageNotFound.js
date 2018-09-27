/**
 * This module provides a component for 404-like views
 * @module fonio/components/AuthorsManager
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Link,
} from 'react-router-dom';
import {
  ModalCard
} from 'quinoa-design-library/components';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';

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
