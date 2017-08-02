/* eslint react/no-set-state:0 */
/**
 * This module provides a reusable bib refs element component
 * It wraps both a plain textarea interface (displaying refs in bibTeX) and a gui interfaces to edit bibliographic references
 * @module fonio/components/BibRefsEditor
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';

import {v4 as generateId} from 'uuid';

import './BibRefsEditor.scss';
import {translateNameSpacer} from '../../helpers/translateUtils';

import BibEditorGui from './BibEditorGui';

import Toaster from '../Toaster/Toaster';

import Cite from 'citation-js';


/**
 * BibRefsEditor class for building react component instances
 */
export default class BibRefsEditor extends Component {


  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
  }

  /**
   * default state
   */
  state = {
    inputIsValid: true,
    refsAsInput: ''
  }


  /**
   * Executes code just after the component mounted
   */
  componentDidMount() {
    if (this.props.references) {
      this.updateStateReferences(this.props.references);
    }
  }


  /**
   * Executes code when component receives new properties
   * @param {object} nextProps - the future properties of the component
   */
  componentWillReceiveProps(nextProps) {
    if (this.props.references !== nextProps.references) {
      this.updateStateReferences(nextProps.references);
    }
  }


  /**
   * Updates the references stored inside the component's state
   * @param {object} references - the references to input as a map
   */
  updateStateReferences = references => {
    const resAsBibTeXParser = new Cite(references);
    const resAsBibTeX = resAsBibTeXParser.get({type: 'string', style: 'bibtex'});
    // preventing unnecessary updates of the textarea
    if (resAsBibTeX !== this.state.refsInput) {
      this.setState({
        refsInput: resAsBibTeX
      });
    }
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const translate = translateNameSpacer(this.context.t, 'Components.BibRefsEditor');

    const {
      references,
    } = this.props;

    const {
      inputIsValid,
      refsInput
    } = this.state;

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
      const expressions = ('\n' + value).split(/\n\@/).filter(val => val.trim().length > 0).map(val => '@' + val);
      // todo: I tried to catch parsing errors in order to display them
      // (to tell the user which refs were misformatted)
      // but did not succeed (does not catch because citation-js throws Syntax errors)
      try {
        let resAsJSONParser;
        resAsJSON = expressions.reduce((result, expression) => {
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

      if (resIsValid && !inputIsValid) {
        this.setState({inputIsValid: true});
      }
      else if (!resIsValid && inputIsValid) {
        this.setState({inputIsValid: false});
      }

      if (resIsValid &&
          typeof this.props.onChange === 'function' &&
          JSON.stringify(resAsJSON) !== JSON.stringify(references)
        ) {
        this.props.onChange(resAsJSON);
      }
    };

    const onReferenceChange = (referenceId, key, value) => {
      if (referenceId === undefined) {
        const refs = references || [];
        return this.props.onChange([...refs, {
          type: 'book',
          title: '',
          author: [{
            // need to provide a truthy value for author's name parts because if not citation-js crashes
            // (pb in citation-js/src/parse/csl.js - function "correctName"
            // evaluates the validity of an author entry
            // by checking if it contains a name.family and name.given
            // but it does it with a truthy test while it should test if undefined instead)
            // @todo: make a PR to citation-js to be able to have empty authors name entries in default new citation
            family: ' ',
            given: ' ',
            // literal: '',
            id: generateId()
          }],
          id: generateId()
        }]);
      }
      const newReferences = references.map(reference => {
        if (reference.id === referenceId) {
          reference[key] = value;
        }
        return reference;
      });
      this.props.onChange(newReferences);
    };

    const onReferenceDelete = referenceId => {
      const newReferences = references.filter(reference => reference.id !== referenceId);
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
              onChange={onReferenceChange}
              onReferenceDelete={onReferenceDelete} />
          </div>
        </div>
      </div>
    );

  }
}


/**
 * Component's properties types
 */
BibRefsEditor.propTypes = {

  /**
   * references list represented in csl-json
   */
  references: PropTypes.array,

  /**
   * triggers a callback with new bibtex references as csl-json
   */
  onChange: PropTypes.func.isRequired,
};


/**
 * Component's context used properties
 */
BibRefsEditor.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired,
};
