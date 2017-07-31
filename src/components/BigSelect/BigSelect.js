/**
 * This module provides a reusable big select element component
 * @module fonio/components/BigSelect
 */
import React from 'react';
import PropTypes from 'prop-types';

import './BigSelect.scss';


/**
 * Renders the BigSelect component as a pure function
 * @param {object} props - used props (see prop types below)
 * @param {object} context - used context data (see context types below)
 * @return {ReactElement} component - the resulting component
 */
const BigSelect = ({
  options,
  onOptionSelect,
  activeOptionId
}) => {
  return (
    <form className="fonio-BigSelect">
      {
        options
        .map((option, key) => {
          const onOptionClick = (evt) => {
            evt.stopPropagation();
            if (option.possible) {
              onOptionSelect(option);
            }
          };
          return (
            <div
              className={'option ' + (option.possible ? 'possible ' : 'impossible') + (option.id === activeOptionId ? 'active' : '')}
              key={key}>
              <input
                type="radio"
                id={option.id}
                name={option.id}
                value="type"
                checked={false} />
              <label
                onClick={onOptionClick}
                htmlFor={option.id}>
                <img className="fonio-icon-image" src={option.icon} />
                <h3>{option.label}</h3>
              </label>
            </div>);
        })
      }
    </form>
  );
};


/**
 * Component's properties types
 */
BigSelect.propTypes = {

  /**
   * options proposed by the component
   */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
      ]),
      id: PropTypes.string,
      possible: PropTypes.bool,
      icon: PropTypes.string,
    })
  ),

  /**
   * Current active option
   */
  activeOptionId: PropTypes.string,

  /**
   * Callbacks when an option is selected
   */
  onOptionSelect: PropTypes.func,
};

export default BigSelect;
