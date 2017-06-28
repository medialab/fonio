/**
 * This module provides a reusable option select component
 * @module fonio/components/OptionSelect
 */
import React from 'react';

import Select from 'react-select';

import 'react-select/dist/react-select.css';
import './OptionSelect.scss';

class OptionSelect extends React.Component {

  constructor(props) {
    super(props);

    this.openSelect = () => this.select.focus();
  }

  render() {
    const {
      activeOptionId,
      options = [],
      title,
      searchable = false,
      onChange
    } = this.props;
    const onSelectChange = (e) => {
      if (e && typeof onChange === 'function') {
        onChange(e.value);
      }
    };
    const bindSelect = select => {
      this.select = select;
    };
    return (
      <li
        onClick={this.openSelect}
        className={'fonio-OptionSelect'}>
        <h5>
          <b>{title}</b>
          <span>►</span>
        </h5>

        <div className="select-container">
          <Select
            name="form-field-name"
            value={activeOptionId}
            searchable={searchable}
            clearable={false}
            ref={bindSelect}
            options={options}
            onChange={onSelectChange} />
        </div>
      </li>
    );
  }
}

export default OptionSelect;
