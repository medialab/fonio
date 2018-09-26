import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form, Text } from 'react-form';
import {
  Button,
  Column,
  Control,
  Field,
  Help,
  HelpPin,
  Label,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

import AuthorsManager from '../AuthorsManager';

import { translateNameSpacer } from '../../helpers/translateUtils';

class NewSectionForm extends Component {
  componentDidMount = () => {
    setTimeout( () => {
      if ( this.form ) {
        const inputs = this.form.getElementsByTagName( 'input' );
        if ( inputs && inputs.length ) {
          inputs[0].focus();
        }
      }
    } );
  }
  render = () => {
    const {
      props: {
        metadata,
        onSubmit,
        onCancel,
        submitMessage,
        style = {},
      },
      context: { t }
    } = this;

    const translate = translateNameSpacer( t, 'Components.NewSectionForm' );

     const errorValidator = ( values ) => {
      return {
        title: !values.title ? translate( 'section-title-is-required' ) : null,
      };
    };

    const handleSubmitFailure = ( error ) => {
      console.error( error );/* eslint no-console : 0 */
    };

    const handleSubmitMetadata = ( values ) => {
      onSubmit( values );
    };

    const bindRef = ( form ) => {
      this.form = form;
    };

    return (
      <Form
        defaultValues={ metadata }
        validate={ errorValidator }
        handleSubmitFailure={ handleSubmitFailure }
        onSubmit={ handleSubmitMetadata }
      >
        {( formApi ) => {
          const handleAuthorsChange = ( authors ) => formApi.setValue( 'authors', authors );
          const handleSubmit = formApi.submitForm;
          return (
            <form
              style={ style }
              ref={ bindRef }
              onSubmit={ handleSubmit }
            >
              <StretchedLayoutContainer isAbsolute>
                <StretchedLayoutItem
                  isFlex={ 1 }
                  isFlowing
                >
                  <Column>
                    <Field>
                      <Control>
                        <Label>
                          {translate( 'Section title' )}
                          <HelpPin place={ 'right' }>
                            {translate( 'Explanation about the section title' )}
                          </HelpPin>
                        </Label>
                        <Text
                          className={ 'input' }
                          field={ 'title' }
                          id={ 'title' }
                          type={ 'text' }
                          placeholder={ translate( 'Section title' ) }
                        />
                      </Control>
                    </Field>
                    {
                      formApi.errors && formApi.errors.title &&
                      <Help
                        isColor={ 'danger' }
                      >
                        {formApi.errors.title}
                      </Help>
                    }
                    <AuthorsManager
                      field={ 'authors' }
                      id={ 'authors' }
                      title={ translate( 'Section authors' ) }
                      titleHelp={ translate( 'help about section authors' ) }
                      onChange={ handleAuthorsChange }
                      authors={ formApi.getValue( 'authors' ) }
                    />
                  </Column>
                </StretchedLayoutItem>
                <StretchedLayoutItem>
                  <StretchedLayoutContainer isDirection={ 'horizontal' }>
                    <StretchedLayoutItem isFlex={ 1 }>
                      <Column>
                        <Button
                          isDisabled={ !formApi.getValue( 'title' ).length }
                          isFullWidth
                          type={ 'submit' }
                          isColor={ 'success' }
                        >
                          {submitMessage || translate( 'Create and start editing' )}
                        </Button>
                      </Column>
                    </StretchedLayoutItem>
                    <StretchedLayoutItem isFlex={ 1 }>
                      <Column>
                        <Button
                          onClick={ onCancel }
                          isFullWidth
                          isColor={ 'danger' }
                        >
                          {translate( 'Cancel' )}
                        </Button>
                      </Column>
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </StretchedLayoutItem>
              </StretchedLayoutContainer>
            </form>
          );
        }}
      </Form>
    );
  }
}

NewSectionForm.contextTypes = {
  t: PropTypes.func,
};
export default NewSectionForm;
