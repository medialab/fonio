/* eslint react/no-set-state : 0 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
  CodeEditor
} from 'quinoa-design-library';
import Cite from 'citation-js';

class BibRefsEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refsInput: '',
    };
  }
  componentDidMount = () => {
    this.updateBibInput(this.props.data);
  }
  componentWillReceiveProps = nextProps => {
    if (this.props.data !== nextProps.data) {
      this.updateBibInput(nextProps.data);
    }
  }

  updateBibInput = data => {
    const resAsBibTeXParser = new Cite(data);
    const resAsBibTeX = resAsBibTeXParser.get({type: 'string', style: 'bibtex'});
    // console.log(parseBibTeXJSON(data));
    if (resAsBibTeX !== this.state.refsInput) {
      this.setState({
        refsInput: resAsBibTeX
      });
    }
  }

  render = () => {
    const {onChange} = this.props;
    const {refsInput} = this.state;

    const onBibTeXInputChange = value => {
      this.setState({
        refsInput: value,
      });
      onChange(value);
    };

    return (<CodeEditor
      onChange={onBibTeXInputChange}
      value={refsInput} />);
  }
}

BibRefsEditor.contextTypes = {
  t: PropTypes.func,
};
export default BibRefsEditor;
