/**
 * This module provides a reusable Footer picker component for fonio
 * @module fonio/components/Footer
 */
import React from 'react';
import PropTypes from 'prop-types';

import LangToggler from '../LangToggler/LangToggler';

import './Footer.scss';
import {translateNameSpacer} from '../../helpers/translateUtils';

const Footer = ({
  openTakeAwayModal,
  togglePreview,
  returnToLanding,
  uiMode,
  lang,
  setLanguage
}, context) => {
  const translate = translateNameSpacer(context.t, 'Components.Footer');
  return (
    <footer className="fonio-Footer">
      <div className="left-group">
        <span className="mini-brand"><button onClick={returnToLanding}>Fonio</button>| {translate('by')} <a href="http://www.medialab.sciences-po.fr/fr/" target="blank">médialab</a></span>
        <LangToggler
          lang={lang}
          onChange={setLanguage} />
      </div>
      <div className="right-group">
        <button className="mode-btn" onClick={togglePreview}>{
          uiMode === 'edition' ?
            <span>
              <img className="fonio-icon-image" src={require('../../sharedAssets/preview-white.svg')} />{translate('preview')}
            </span>
          :
            <span>
              <img className="fonio-icon-image" src={require('../../sharedAssets/edit-white.svg')} />{translate('edit')}
            </span>
        }</button>
        <button className="takeaway-btn" onClick={openTakeAwayModal}><img className="fonio-icon-image" src={require('../../sharedAssets/take-away-white.svg')} />{translate('take-away')}</button>
      </div>
    </footer>
  );
};

Footer.contextTypes = {
  t: PropTypes.func.isRequired
};

export default Footer;
