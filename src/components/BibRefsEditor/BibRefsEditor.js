/* eslint react/no-set-state:0 */
/* eslint react/forbid-prop-types:0 */
/**
 * This module provides a reusable bib refs element component
 * @module fonio/components/BibRefsEditor
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';

import './BibRefsEditor.scss';
import {translateNameSpacer} from '../../helpers/translateUtils';

import BibEditorGui from './BibEditorGui';

import Toaster from '../Toaster/Toaster';

import Cite from 'citation-js';

export default class BibRefsEditor extends Component {
  propTypes = {
    /**
     * references list represented in csl-json
     */
    references: PropTypes.array,
    /**
     * triggers a callback with new bibtex references as csl-json
     */
    onChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
  }

  state = {
    inputIsValid: true,
    refsAsInput: ''
  }

  componentDidMount() {
    if (this.props.references) {
      this.updateStateReferences(this.props.references);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.references !== nextProps.references) {
      this.updateStateReferences(nextProps.references);
    }
  }

  updateStateReferences = references => {
    const resAsBibTeXParser = new Cite(references);
    const resAsBibTeX = resAsBibTeXParser.get({type: 'string', style: 'bibtex'});
    this.setState({
      refsInput: resAsBibTeX
    });
  }

  render() {

    const translate = translateNameSpacer(this.context.t, 'Components.BibRefsEditor');

    const {
      references,
    } = this.props;

    const {
      inputIsValid,
      refsInput
    } = this.state;

    // const resAsBibTeXParser = new Cite(references);
    // const resAsBibTeX = resAsBibTeXParser.get({type: 'string', style: 'bibtex'});

    const onBibTeXInputChange = e => {
      const value = e.target.value;
      this.setState({
        refsInput: value,
      });
      let resAsJSON;
      let resIsValid;
      try {
        const resAsJSONParser = new Cite(value, {type: 'string', style: 'bibtex'});
        resAsJSON = resAsJSONParser.get({type: 'json', style: 'csl'});
        resIsValid = resAsJSON.length > 0;
      }
      catch (error) {
        resIsValid = false;
      }

      if (resIsValid && !inputIsValid) {
        this.setState({inputIsValid: true});
      }
 else if (!resIsValid && inputIsValid) {
        this.setState({inputIsValid: false});
      }

      if (resIsValid && typeof this.props.onChange === 'function') {
        this.props.onChange(resAsJSON);
      }
    };

    const onReferenceChange = (referenceId, key, value) => {
      if (referenceId === undefined) {
        const refs = references || [];
        return this.props.onChange([...refs, {}]);
      }
      const newReferences = references.map(reference => {
        if (reference.id === referenceId) {
          reference[key] = value;
        }
        return reference;
      });
      this.props.onChange(newReferences);
    };

    return (
      <div className="fonio-BibRefsEditor">
        <div className="reference-editors-container">
          <div className="bibtext-editor-container">
            <h4>{translate('bibtex-input-title')}</h4>
            <Textarea
              placeholder={translate('manual-input-bibtex-prompt')}
              value={refsInput}
              onChange={onBibTeXInputChange} />
            <Toaster
              status={inputIsValid ? 'success' : 'failure'}
              log={inputIsValid ? translate('input-is-valid') : translate('input-is-invalid')} />
          </div>
          <div className="gui-editor-container">
            <h4>{translate('bibtex-gui-title')}</h4>
            <BibEditorGui
              references={references}
              onChange={onReferenceChange} />
          </div>
        </div>
      </div>
    );

  }
}

BibRefsEditor.contextTypes = {
  t: PropTypes.func.isRequired,
};
