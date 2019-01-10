/**
 * This module provides a component allowing to manage an authors list
 * @module fonio/components/AuthorsManager
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Control,
  Field,
  Level,
  HelpPin,
  Label,
  Delete,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';

class AuthorsManager extends Component {
  constructor( props ) {
    super( props );
    this.inputs = {};
  }

  focusOnLastInput = () => {
    const lastInputKey = this.props.authors.length - 1;
    if ( this.inputs[lastInputKey] ) {
      this.inputs[lastInputKey].focus();
    }
  }

  render = () => {

    /**
     * Variables definition
     */
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

    /**
     * Computed variables
     */
    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.AuthorsManager' );

    /**
     * Callbacks handlers
     */
    const handleAddAuthor = ( e ) => {
      e.preventDefault();
      const newAuthors = [
        ...authors,
        ''
      ];
      onChange( newAuthors );
      setTimeout( this.focusOnLastInput );
    };

    const handleSubmit = () => {
      // handleAddAuthor(e);
    };

    return (
      <Field>
        <Label>
          {title || translate( 'Authors' )}
          <HelpPin place={ 'right' }>
            {titleHelp || translate( 'Explanation about the story authors' )}
          </HelpPin>
        </Label>
        {
          authors &&
          authors.map( ( author, index ) => {
            const onAuthorChange = ( e ) => {
              const value = e.target.value;
              const newAuthors = [ ...authors ];
              newAuthors[index] = value;
              onChange( newAuthors );
            };
            const onRemoveAuthor = () => {
              const newAuthors = [
                ...authors.slice( 0, index ),
                ...authors.slice( index + 1 )
              ];
              onChange( newAuthors );
              setTimeout( this.focusOnLastInput );
            };
            const bindInput = ( input ) => {
              this.inputs[index] = input;
            };
            return (
              <form
                onSubmit={ handleSubmit }
                key={ index }
              >
                <Control hasIcons>
                  <StretchedLayoutContainer
                    style={ { alignItems: 'center' } }
                    isDirection={ 'horizontal' }
                  >

                    <StretchedLayoutItem>
                      <span>
                        <FontAwesomeIcon
                          icon={ faUser }
                        />
                      </span>
                    </StretchedLayoutItem>
                    <StretchedLayoutItem isFlex={ 1 }>
                      <input
                        className={ 'input' }
                        ref={ bindInput }
                        placeholder={ translate( 'New author' ) }
                        value={ author }
                        onChange={ onAuthorChange }
                      />
                    </StretchedLayoutItem>
                    <StretchedLayoutItem>
                      <Delete onClick={ onRemoveAuthor } />
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Control>
              </form>
            );
          } )
        }
        <Level>
          <Button
            isFullWidth
            onClick={ handleAddAuthor }
          >
            {translate( 'Add an author' )}
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

