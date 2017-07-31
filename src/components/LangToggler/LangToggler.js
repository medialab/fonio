/**
 * This module provides a reusable lang toggler component
 * @module fonio/components/LangToggler
 */
import React from 'react';
import PropTypes from 'prop-types';

import './LangToggler.scss';


/**
 * Renders the LangToggler component as a pure function
 * @param {object} props - used props (see prop types below)
 * @return {ReactElement} component - the resulting component
 */
const LangToggler = ({
  lang,
  onChange
}) => {
  // todo: this component assume only two languages are available
  // and should be change if more are added
  // (adding a "availableLanguages" array prop for starters)
  const otherLang = lang === 'en' ? 'fr' : 'en';
  const onClick = e => {
    e.stopPropagation();
    if (lang === 'en') {
     onChange('fr');
    }
    else {
      onChange('en');
    }
  };
  return (
    <button onClick={onClick} className="fonio-LangToggler">
      <span className="active">{lang}</span>/<span>{otherLang}</span>
    </button>
  );
};

/**
 * Component's properties types
 */
LangToggler.propTypes = {

  /**
   * The current active lang
   */
  lang: PropTypes.string,

  /**
   * Callbacks when lang is changed
   */
  onChange: PropTypes.func,
};

export default LangToggler;
