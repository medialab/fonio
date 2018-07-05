import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Control,
  Field,
  Level,
  HelpPin,
  Icon,
  Label,
  Input,
  Delete,
} from 'quinoa-design-library/components/';

import {translateNameSpacer} from '../../helpers/translateUtils';

const AuthorsManager = ({
  authors,
  onChange
}, {t}) => {
  const translate = translateNameSpacer(t, 'Components.AuthorsManager');

  const onAddAuthor = e => {
  e.preventDefault();
  e.stopPropagation();
  const newAuthors = [
    ...authors,
    ''
  ];
  onChange(newAuthors);
  };
  return (
    <Field>
      <Label>
          Authors
        <HelpPin place="right">
          Explanation about the story authors
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
          };
          return (
            <div key={index}>
              <Control hasIcons>
                <Input
                  isColor="success"
                  placeholder={translate('New auhthor')}
                  value={author}
                  onChange={onAuthorChange} />
                <Icon isSize="small" isAlign="left">
                  <span className="fa fa-user" aria-hidden="true" />
                </Icon>
                <Icon isSize="small" isAlign="right" className="is-clickable">
                  <Delete onClick={onRemoveAuthor} />
                </Icon>
              </Control>
            </div>
          );
        })
      }
      <Level />
      <Level>
        <Button isFullWidth onClick={onAddAuthor}>
          {translate('Add an author')}
        </Button>
      </Level>
    </Field>
  );
};

AuthorsManager.contextTypes = {
  t: PropTypes.func.isRequired
};

export default AuthorsManager;

