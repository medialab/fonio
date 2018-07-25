/**
 * This module provides a reusable bibliography preview element component
 * Displays a simple bibliography
 * @module fonio/components/BibliographicPreview
 */

import React from 'react';
import PropTypes from 'prop-types';

const english = require('raw-loader!./english-locale.xml');
const apa = require('raw-loader!./apa.csl');

import {Bibliography} from 'react-citeproc';

import {
  Content
} from 'quinoa-design-library/components';

import './BibliographicPreview.scss';


/**
 * Renders the BibliographicPreview component as a pure function
 * @param {object} props - used props (see prop types below)
 * @todo: load style and locale from currently set style and locale
 * @return {ReactElement} component - the resulting component
 */
const BibliographicPreview = ({
  items
}) => (
  <Content>
    <blockquote>
      <Bibliography
        items={items}
        style={apa}
        locale={english} />
    </blockquote>
  </Content>
);


/**
 * Component's properties types
 */
BibliographicPreview.propTypes = {

  /**
   * Map of the bibliographic items to render (keys are ids)
   */
  items: PropTypes.object,
};

export default BibliographicPreview;
