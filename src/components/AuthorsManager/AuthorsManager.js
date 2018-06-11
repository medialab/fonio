import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Control,
  Field,
  HelpPin,
  Icon,
  Label,
  Input,
  Delete,
} from 'quinoa-design-library/components/';

const AuthorsManager = ({
  authors,
  onChange
}, {t}) => {
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
                  placeholder={'new author'}
                  value={author}
                  onChange={onAuthorChange} />
                <Icon isSize="small" isAlign="left">
                  <span className="fa fa-user" aria-hidden="true" />
                </Icon>
                <Icon isSize="small" isAlign="right" style={{pointerEvents: 'auto'}}>
                  <Delete onClick={onRemoveAuthor} />
                </Icon>
              </Control>
            </div>
          );
        })
      }
      <Button onClick={onAddAuthor}>
        Add an author
      </Button>
    </Field>
  );
};

AuthorsManager.contextTypes = {
  t: PropTypes.func.isRequired
};

export default AuthorsManager;

