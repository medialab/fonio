import React from 'react';

const english = require('raw-loader!./english-locale.xml');
const apa = require('raw-loader!./apa.csl');

import {Bibliography} from 'react-citeproc';

import './BibliographicPreview.scss';

const BibliographicPreview = ({
  items
}) => (
  <Bibliography
    items={items}
    style={apa}
    locale={english} />
);

export default BibliographicPreview;
