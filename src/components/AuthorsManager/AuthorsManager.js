import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Control,
  Field,
  Level,
  HelpPin,
  Icon,
  Label,
  // Input,
  Delete,
} from 'quinoa-design-library/components/';

import {translateNameSpacer} from '../../helpers/translateUtils';

class AuthorsManager extends Component {
  constructor(props) {
    super(props);
    this.inputs = {};
  }

  focusOnLastInput = () => {
    const lastInputKey = this.props.authors.length - 1;
    if (this.inputs[lastInputKey]) {
      this.inputs[lastInputKey].focus();
    }
  }


  render = () => {
    const {
      props: {
        authors = [],
        onChange,
        title,
        titleHelp,
      },
      context: {
        t
      }
    } = this;
    const translate = translateNameSpacer(t, 'Components.AuthorsManager');

    const onAddAuthor = e => {
      e.preventDefault();
      // e.stopPropagation();
      const newAuthors = [
        ...authors,
        ''
      ];
      onChange(newAuthors);
      setTimeout(this.focusOnLastInput);
    };

    const handleSubmit = e => {
      // onAddAuthor(e);
    };
    return (
      <Field>
        <Label>
          {title || translate('Authors')}
          <HelpPin place="right">
            {titleHelp || translate('Explanation about the story authors')}
          </HelpPin>
        </Label>
        {
          authors &&
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
              setTimeout(this.focusOnLastInput);
            };
            const bindInput = input => {
              this.inputs[index] = input;
            };
            return (
              <form onSubmit={handleSubmit} key={index}>
                <Control hasIcons>
                  <input
                    className="input"
                    ref={bindInput}
                    placeholder={translate('New author')}
                    value={author}
                    onChange={onAuthorChange} />
                  <Icon isSize="small" isAlign="left">
                    <span className="fa fa-user" aria-hidden="true" />
                  </Icon>
                  <Icon isSize="small" isAlign="right" className="is-clickable">
                    <Delete onClick={onRemoveAuthor} />
                  </Icon>
                </Control>
              </form>
            );
          })
        }
        <Level>
          <Button isFullWidth onClick={onAddAuthor}>
            {translate('Add an author')}
          </Button>
        </Level>
      </Field>
    );
  }
}


AuthorsManager.contextTypes = {
  t: PropTypes.func.isRequired
};

export default AuthorsManager;

