/**
 * This module provides a reusable inline citation widget component
 * @module fonio/components/SectionEditor
 */
/* eslint react/no-set-state: 0 */
/**
 * Imports Libraries
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

/**
 * Imports Project utils
 */
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
    startExistingResourceConfiguration: PropTypes.func,
  }

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor( props ) {
    super( props );
    this.state = {
      contextualizerOpen: false,
      asset: props.asset,
    };
  }

  componentWillReceiveProps ( nextProps, nextState ) {
    if ( this.props.asset !== nextProps.asset || this.state.contextualizerOpen !== nextState.contextualizerOpen ) {
      this.setState( {
        asset: nextProps.asset,
      } );
    }
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
      || this.state.asset !== nextState.asset
    );
  }

  componentDidUpdate = ( prevProps, prevState ) => {
    if ( !prevState.contextualizerOpen && this.state.contextualizerOpen && this.locatorInput ) {
      this.locatorInput.blur();
    }
  }

  toggleContextualizer = () => {
    this.setState( {
      contextualizerOpen: !this.state.contextualizerOpen
    } );
  }

  handleSubmit = () => {
    const {
      asset: {
        contextualizer
      }
    } = this.state;
    this.props.onAssetChange( 'contextualizer', contextualizer.id, contextualizer );
    this.toggleContextualizer();
  }

  /**
   * Opens the contextualization's details definition ui
   */

  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {

    /**
     * Variables definition
     */
    const {
      children,

      /*
       * asset,
       * onAssetChange,
       */
      onAssetFocus,
      customContext = {},
    } = this.props;
    const {
      asset,
      contextualizerOpen
    } = this.state;
    const {
      toggleContextualizer,
      handleSubmit,
    } = this;
    const {
      t,
      startExistingResourceConfiguration,
      // citations,
    } = this.context;

    const {
      resource,
      contextualizer,
    } = asset;

    /**
     * Computed variables
     */
    // const representation = asset && citations && citations[asset.id];
    const representation = asset && customContext && customContext.citations
     && customContext.citations.citationComponents && customContext.citations.citationComponents[asset.id];

    /**
     * Local functions
     */
    const translate = translateNameSpacer( t, 'Components.InlineCitation' );

    /**
     * Callbacks handlers
     */
    const onAssetChange = ( key, id, value ) => {
      const newAsset = {
        ...asset,
        [key]: {
          ...value
        }
      };
      this.setState( {
        asset: newAsset
      } );
    };
    const handleClickOnEdit = () => {
      this.toggleContextualizer();
      startExistingResourceConfiguration( resource.id );
    };

    const handleLocatorChange = ( event ) => {
      const { target: { value: locator } } = event;
      event.stopPropagation();
      const newContextualizer = {
        ...contextualizer,
        locator
      };
      onAssetChange( 'contextualizer', contextualizer.id, newContextualizer );
    };
    const handleSuffixChange = ( event ) => {
      const { target: { value: suffix } } = event;
      event.stopPropagation();
      const newContextualizer = {
        ...contextualizer,
        suffix
      };
      onAssetChange( 'contextualizer', contextualizer.id, newContextualizer );
    };

    const handleInputClick = ( e ) => {
      onAssetFocus( e );
      e.stopPropagation();
    };

    const bindLocatorInput = ( locatorInput ) => {
      this.locatorInput = locatorInput;
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
                    ref={ bindLocatorInput }
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
            onClick={ handleSubmit }
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
