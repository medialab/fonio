/**
 * This module provides a reusable option select component
 * @module fonio/components/OptionSelect
 */
import React from 'react';
import PropTypes from 'prop-types';

import Select from 'react-select';

import 'react-select/dist/react-select.css';
import './OptionSelect.scss';


/**
 * OptionSelect class for building react component instances
 */
class OptionSelect extends React.Component {


  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
    this.openSelect = () => this.select.focus();
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
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

/**
 * Component's properties types
 */
OptionSelect.propTypes = {

  /**
   * The available options
   */
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })),

  /**
   * The id of the selected option
   */
  activeOptionId: PropTypes.string,

  /**
   * Title/label of the input
   */
  title: PropTypes.string,

  /**
   * Whether user can search by text query in the select
   */
  searchable: PropTypes.bool,

  /**
   * Callbacks when an option is selected
   */
  onChange: PropTypes.func,
};

export default OptionSelect;
