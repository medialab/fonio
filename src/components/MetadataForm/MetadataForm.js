/**
 * This module provides a story edition form
 * @module fonio/components/MetadataForm
 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form, Text, TextArea } from 'react-form';
import {
  Button,
  Control,
  Field,
  Column,
  Columns,
  Label,
  Help,
} from 'quinoa-design-library/components/';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';

/**
 * Imports Components
 */
import AuthorsManager from '../AuthorsManager';
import ExplainedLabel from '../ExplainedLabel';
import PasswordInput from '../PasswordInput';

class MetadataForm extends Component {

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

    /**
     * Variables definition
     */
    const {
      props: {
        story,
        status,
        onSubmit,
        onCancel,
      },
      context: {
        t
      }
    } = this;

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.MetadataForm' );
    const errorValidator = ( values ) => {
      return {
        title: !values.title ? translate( 'Story title is required' ) : null,
        password: ( !story.id && ( !values.password || values.password.length < 6 ) ) ? translate( 'Password should be at least 6 characters' ) : null,
      };
    };

    /**
     * Callbacks handlers
     */
    const handleSubmitForm = ( values ) => {
      const newValues = { ...values };
      delete newValues.password;
      // parse authors
      const authors = newValues.authors
                      // .reduce((result, item) => result.concat(item.split(',')), [])
                      .map( ( d ) => d.trim() )
                      .filter( ( d ) => d.length > 0 );
      const payload = {
        ...story,
        metadata: {
          ...story.metadata,
          ...newValues,
          authors
        },
      };
      onSubmit( { payload, password: values.password } );
    };

    /**
     * References bindings
     */
    const bindRef = ( form ) => {
      this.form = form;
    };

    return (
      <Form
        defaultValues={ story.metadata }
        validate={ errorValidator }
        onSubmit={ handleSubmitForm }
      >
        {( formApi ) => {
          const onAuthorsChange = ( authors ) => formApi.setValue( 'authors', authors );
          const handleSubmit = formApi.submitForm;
          return (
            <form
              ref={ bindRef }
              onSubmit={ handleSubmit }
            >
              <Field>
                <Control>
                  <ExplainedLabel
                    title={ translate( 'Story title' ) }
                    explanation={ translate( 'Explanation about the story title' ) }
                  />
                  <Text
                    className={ 'input' }
                    field={ 'title' }
                    id={ 'title' }
                    type={ 'text' }
                    placeholder={ translate( 'title' ) }
                  />
                </Control>
                {
                  formApi.touched.title && formApi.errors && formApi.errors.title &&
                    <Help isColor={ 'danger' }>{formApi.errors.title}</Help>
                }
              </Field>
              <Field>
                <Control>
                  <ExplainedLabel
                    title={ translate( 'Story subtitle' ) }
                    explanation={ translate( 'Explanation about the story subtitle' ) }
                  />
                  <Text
                    className={ 'input' }
                    field={ 'subtitle' }
                    id={ 'subtitle' }
                    type={ 'text' }
                    placeholder={ translate( 'subtitle' ) }
                  />
                </Control>
              </Field>
              {
                !story.id &&
                  <Field>
                    <ExplainedLabel
                      title={ translate( 'Story password' ) }
                      explanation={ translate( 'Explanation about the story password' ) }
                    />
                    <PasswordInput id={ 'password' } />
                    {
                      formApi.touched.password && formApi.errors && formApi.errors.password &&
                        <Help isColor={ 'danger' }>{formApi.errors.password}</Help>
                    }
                  </Field>
              }
              <AuthorsManager
                field={ 'authors' }
                id={ 'authors' }
                onChange={ onAuthorsChange }
                authors={ formApi.getValue( 'authors' ) }
              />
              <Field>
                <Label>{translate( 'Story Abstract' )}</Label>
                <Control hasIcons>
                  <TextArea
                    className={ 'textarea' }
                    field={ 'abstract' }
                    id={ 'abstract' }
                    type={ 'text' }
                    placeholder={ translate( 'abstract' ) }
                  />
                </Control>
              </Field>
              {!story.id && status === 'processing' && <Help>{translate( 'Creating story' )}</Help>}
              {!story.id && status === 'fail' && <Help isColor={ 'danger' }>{translate( 'Story could not be created' )}</Help>}
              <Columns>
                <Column isSize={ 6 }>
                  <Button
                    isFullWidth
                    type={ 'submit' }
                    isColor={ 'success' }
                  >
                    {story.id ?
                      <span>{translate( 'Update settings' )}</span> :
                      <span>{translate( 'Create story' )}</span>
                    }
                  </Button>
                </Column>
                <Column isSize={ 6 }>
                  <Button
                    onClick={ onCancel }
                    isFullWidth
                    isColor={ 'danger' }
                  >
                    {translate( 'Cancel' )}
                  </Button>
                </Column>
              </Columns>
            </form>
          );
          }
        }
      </Form>
    );
  }
}

MetadataForm.contextTypes = {
  t: PropTypes.func,
};
export default MetadataForm;
