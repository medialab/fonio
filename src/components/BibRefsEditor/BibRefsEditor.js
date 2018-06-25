/* eslint react/no-set-state : 0 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {TextArea} from 'quinoa-design-library';
import Cite from 'citation-js';

import {translateNameSpacer} from '../../helpers/translateUtils';

class BibRefsEditor extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      refsInput: ''
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
    if (resAsBibTeX !== this.state.refsInput) {
      this.setState({
        refsInput: resAsBibTeX
      });
    }
  }

  render = () => {
    const {onChange} = this.props;
    const {refsInput} = this.state;
    const onBibTeXInputChange = e => {
      const value = e.target.value;
      this.setState({
        refsInput: value,
      });
      let resAsJSON;
      let resIsValid;
      // this operation is aimed at parsing all input references
      // even if some as misformatted for citation-js and will throw errors
      // the hack is aimed at separating each reference in a separate string.
      // If not doing that the first error thrown stops the process for the next bib entries, even if valid
      const expressions = ('\n' + value).split(/\n\@/)
                          .filter(val => val.trim().length > 0).map(val => '@' + val)
                          .slice(0, 1);
      // todo: I tried to catch parsing errors in order to display them
      // (to tell the user which refs were misformatted)
      // but did not succeed (does not catch because citation-js throws Syntax errors)
      try {
        let resAsJSONParser;
        resAsJSON = expressions.slice(0, 1).reduce((result, expression) => {
          resAsJSONParser = new Cite(expression, {type: 'string', style: 'bibtex'});
          const ref = resAsJSONParser.get({type: 'json', style: 'csl'});
          // take only non-throwing results
          if (ref) {
            result = result.concat(ref);
          }
          return result;
        }, []);
        resIsValid = resAsJSON.length > 0 && expressions.length === resAsJSON.length;
      }
      catch (error) {
        resIsValid = false;
      }
      if (resIsValid) {
        onChange(resAsJSON);
      }
      else {
        console.log('invalid input');
      }
    };
    return (
      <TextArea value={refsInput} type="text" onChange={onBibTeXInputChange} />
    );
  }
}

BibRefsEditor.contextTypes = {
  t: PropTypes.func,
};
export default BibRefsEditor;
