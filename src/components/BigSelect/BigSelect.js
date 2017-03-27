/**
 * This module provides a reusable big select element component
 * @module fonio/components/BigSelect
 */
import React from 'react';

import './BigSelect.scss';

const BigSelect = ({
  options,
  onOptionSelect,
  activeOptionId
}) => {
  return (
    <form className="fonio-big-select">
      {
        options
        .map((option, key) => {
          const onOptionClick = (evt) => {
            evt.stopPropagation();
            onOptionSelect(option);
          };
          return (
            <div className={'option ' + (option.possible ? 'possible ' : 'impossible') + (option.id === activeOptionId ? 'active' : '')}
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

export default BigSelect;
