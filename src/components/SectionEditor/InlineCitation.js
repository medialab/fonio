/* eslint react/no-set-state: 0 */
/**
 * This module provides a reusable inline citation widget component
 * @module fonio/components/InlineCitation
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  ModalCard,
  Button,
  Field,
  Label,
  Column,
  Control,
  HelpPin,
} from 'quinoa-design-library/components';

import { translateNameSpacer } from '../../helpers/translateUtils';

/**
 * InlineCitation class for building react component instances
 */
class InlineCitation extends Component {

  /**
   * Component's context used properties
   */
  static contextTypes = {
    t: PropTypes.func.isRequired,
    citations: PropTypes.object,
    startExistingResourceConfiguration: PropTypes.func
  }

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor( props ) {
    super( props );
    this.state = {
      contextualizerOpen: false
    };
  }

  /**
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @param {object} nextState - the state to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate( nextProps, nextState ) {
    return (
      this.props.asset !== nextProps.asset
      || this.props.customContext !== nextProps.customContext
      || this.state.contextualizerOpen !== nextState.contextualizerOpen
    );
  }

  toggleContextualizer = () => {
    this.setState( {
      contextualizerOpen: !this.state.contextualizerOpen
    } );
  }

  /**
   * Opens the contextualization's details definition ui
   */

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const {
      children,
      asset,
      onAssetChange,
      onAssetFocus,
    } = this.props;
    const {
      contextualizerOpen
    } = this.state;
    const {
      toggleContextualizer
    } = this;
    const {
      t,
      startExistingResourceConfiguration,
      citations,
    } = this.context;

    const {
      resource,
      contextualizer,
    } = asset;

    const handleClickOnEdit = () => {
      this.toggleContextualizer();
      startExistingResourceConfiguration( resource.id );
    };

    const translate = translateNameSpacer( t, 'Components.InlineCitation' );
    const representation = asset && citations && citations[asset.id];
    const handleLocatorChange = ( { target: { value: locator } } ) => {
      const newContextualizer = {
        ...contextualizer,
        locator
      };
      onAssetChange( 'contextualizer', contextualizer.id, newContextualizer );
    };
    const handleSuffixChange = ( { target: { value: suffix } } ) => {
      const newContextualizer = {
        ...contextualizer,
        suffix
      };
      onAssetChange( 'contextualizer', contextualizer.id, newContextualizer );
    };

    const handleInputClick = ( e ) => {
      onAssetFocus( e );
    };
    return [
      <span
        onClick={ toggleContextualizer }
        contentEditable={ false }
        className={ 'is-clickable' }
        style={ { color: '#00A99D' } }
        key={ 0 }
      >
        {( representation && representation.Component ) || translate( 'loading citation' )}
      </span>,
      <span
        key={ 1 }
        style={ { display: 'none' } }
      >{children}
      </span>,
      <ModalCard
        key={ 2 }
        isActive={ contextualizerOpen }
        headerContent={ translate( 'Edit short citation' ) }
        onClose={ toggleContextualizer }
        mainContent={
          <form onSubmit={ toggleContextualizer }>
            <Column>
              <Field>
                <Control>
                  <Label>
                    {translate( 'Citation location' )}
                    <HelpPin place={ 'right' }>
                      {translate( 'Page number, chapter, section...' )}
                    </HelpPin>
                  </Label>
                  <input
                    className={ 'input' }
                    onClick={ handleInputClick }
                    value={ contextualizer.locator || '' }
                    field={ 'locator' }
                    id={ 'locator' }
                    type={ 'text' }
                    onChange={ handleLocatorChange }
                    placeholder={ translate( 'citation location' ) }
                  />
                </Control>
              </Field>
              <Field>
                <Control>
                  <Label>
                    {translate( 'Additional comment' )}
                    <HelpPin place={ 'right' }>
                      {translate( 'Additional comment to this citation (version, context, etc.)' )}
                    </HelpPin>
                  </Label>
                  <input
                    className={ 'input' }
                    onClick={ handleInputClick }
                    value={ contextualizer.suffix || '' }
                    field={ 'suffix' }
                    id={ 'suffix' }
                    type={ 'text' }
                    onChange={ handleSuffixChange }
                    placeholder={ translate( 'additionnal comment' ) }
                  />
                </Control>
              </Field>
            </Column>
          </form>
        }
        footerContent={ [
          <Button
            type={ 'submit' }
            isFullWidth
            key={ 0 }
            onClick={ toggleContextualizer }
            isColor={ 'primary' }
          >
            {translate( 'Validate' )}
          </Button>,
          <Button
            type={ 'submit' }
            isFullWidth
            key={ 1 }
            onClick={ handleClickOnEdit }
            isColor={ 'info' }
          >
            {translate( 'Edit reference' )}
          </Button>,
        ] }
      />
    ];
  }
}

/**
 * Component's properties types
 */
InlineCitation.propTypes = {

  /**
   * The asset to consume for displaying the inline citation
   */
  asset: PropTypes.object,

  /**
   * Children react elements of the component
   */
  children: PropTypes.array,

  /**
   * Callbacks when an asset is blured
   */
  onAssetBlur: PropTypes.func,

  /**
   * Callbacks when an asset is changed
   */
  onAssetChange: PropTypes.func,

  /**
   * Callbacks when an asset is focused
   */
  onAssetFocus: PropTypes.func,
};

export default InlineCitation;
