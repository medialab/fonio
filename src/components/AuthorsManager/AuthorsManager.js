/**
 * This module provides a reusable big select element component
 * @module fonio/components/BigSelect
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './AuthorsManager.scss';
import {translateNameSpacer} from '../../helpers/translateUtils';

class AuthorsManager extends Component {

  constructor(props) {
    super(props);
    this.inputs = {};
    this.focusOnLastAuthor = () => {
      setTimeout(() => {
        const keys = Object.keys(this.inputs).sort();
        if (keys.length) {
          let focused;
          do {
            const last = keys.pop();
            if (this.inputs[last]) {
              this.inputs[last].focus();
              focused = true;
            }
          } while (!focused && keys.length);
        }
      }, 10);
    };
  }
  render() {
    const {
      authors,
      onChange
    } = this.props;
    const {
      context
    } = this;
    const translate = translateNameSpacer(context.t, 'Components.AuthorsManager');
    const onAddAuthor = e => {
      e.preventDefault();
      e.stopPropagation();
      const newAuthors = [
        ...authors,
        ''
      ];
      onChange(newAuthors);
      this.focusOnLastAuthor();
    };
    return (
      <form className="fonio-authors-manager" onSubmit={onAddAuthor}>
        <ul>
          {
          authors.map((author, index) => {
            const onAuthorChange = e => {
              const value = e.target.value;
              const newAuthors = [...authors];
              newAuthors[index] = value;
              onChange(newAuthors);
            };
            const onRemoveAuthor = () => {
              const newAuthors = [
                ...authors.slice(0, index),
                ...authors.slice(index + 1)
              ];
              onChange(newAuthors);
              this.focusOnLastAuthor();
            };
            const onKeyUp = e => {
              if (e.keyCode === 8 && author.length === 0) {
                onRemoveAuthor();
              }
 else if (e.keyCode === 13) {
                onAddAuthor(e);
              }
            };
            const bindRef = input => {
              this.inputs[index] = input;
            };
            return (
              <li key={index}>
                <span className="icon-container remove-btn" onClick={onRemoveAuthor}>
                  <img src={require('./assets/close.svg')} className="fonio-icon-image" />
                </span>
                <input
                  className="main-part"
                  ref={bindRef}
                  type="text"
                  placeholder={translate('new-author')}
                  value={author}
                  onChange={onAuthorChange}
                  onKeyUp={onKeyUp} />
              </li>);
          })
        }
          <li className="add-author" onClick={onAddAuthor}>
            <span className="icon-container">
              <img
                src={require('./assets/close.svg')}
                className="fonio-icon-image"
                style={{
                transform: 'rotate(45deg)'
              }} />

            </span>
            <span
              className="main-part">{translate('add-author')}</span>
          </li>
        </ul>
      </form>
    );
  }
}

AuthorsManager.contextTypes = {
  t: PropTypes.func.isRequired
};

export default AuthorsManager;
