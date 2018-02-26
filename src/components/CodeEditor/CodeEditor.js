/* eslint no-unused-vars : 0 */
/* eslint react/no-set-state : 0 */
/**
 * This module provides a code editor element component
 * Sets the mode of an aside ui column
 * @module fonio/components/CodeEditor
 */
import React, {Component} from 'react';
import {Controlled as CodeMirror} from 'react-codemirror2';
import {debounce} from 'lodash';

import 'codemirror/lib/codemirror.css';
import js from 'codemirror/mode/javascript/javascript';
import xml from 'codemirror/mode/xml/xml';
import css from 'codemirror/mode/css/css';

import './CodeEditor.scss';

const TRIGGER_DEBOUNCE_DELAY = 500;

class CodeEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value || ''
    };
    this.debouncedTriggerChange = debounce(this.triggerChange, TRIGGER_DEBOUNCE_DELAY);
  }


  triggerChange = code => {
    if (this.props.onChange && typeof this.props.onChange === 'function') {
      this.props.onChange(code);
    }
  }


  onChange = (editor, metadata, code) => {
    this.setState({
      value: code
    });
    this.debouncedTriggerChange(code);
  };

  onClick= e => {
    if (this.props.onClick && typeof this.props.onClick === 'function') {
      this.props.onClick(e);
    }
    if (this.props.onFocus && typeof this.props.onFocus === 'function') {
      this.props.onFocus(e);
    }
    e.stopPropagation();
  }

  render() {
    const {
      onChange,
      onClick,
      props: {
        // value = '',
        mode = 'css',
        lineNumbers = true
      },
      state: {
        value
      }
    } = this;
    return (
      <div className="fonio-CodeEditor" onClick={onClick}>
        <CodeMirror
          value={value}
          options={{
            mode,
            lineNumbers
          }}
          onBeforeChange={(editor, data, thatValue) => {
            this.setState({value: thatValue}); // state management here
          }}
          onChange={(editor, data, thatValue) => {
            // downstream callback
            this.onChange(editor, data, thatValue);
          }} />
      </div>
    );
  }
}

export default CodeEditor;
