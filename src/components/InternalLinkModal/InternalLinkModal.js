/**
 * This module provides a modal for adding a link to another section in the editor
 * @module fonio/components/InternalLinkModal
 */
/* eslint react/no-set-state : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  ModalCard,
  Button,
  Image,
  Dropdown,
  FlexContainer,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';
import { abbrevString } from '../../helpers/misc';

class InternalLinkModal extends Component {

  static contextTypes = {
    t: PropTypes.func,
  };
  constructor( props ) {
    super( props );
    this.state = {
      selectedSectionId: undefined,
      dropdownOpen: false
    };
  }

  componentDidMount = () => {
    this.updateSelection( this.props );
  }

  componentWillReceiveProps = ( nextProps ) => {
    if ( this.props.focusData && nextProps.focusData ) {
      this.updateSelection( nextProps );
    }
  }

  updateSelection = ( props ) => {
    if ( props.focusData && props.focusData.selectedSectionId ) {
      this.setState( {
        selectedSectionId: props.focusData.selectedSectionId
      } );
    }
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      props: {
        onClose,
        isActive,
        onCreateInternalLink,
        inactiveSections,
        focusData
      },
      state: {
        selectedSectionId,
        dropdownOpen,
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
    const translate = translateNameSpacer( t, 'Components.InternalLinkModal' );

    /**
     * Callbacks handlers
     */
    const handleConfirm = () => {
      onCreateInternalLink( {
        contentId: focusData.focusId,
        selection: focusData.selection,
        selectedSectionId
      } );

      /*
       * if ( url && url.length ) {
       *   onCreateHyperlink( { url, title }, focusData.focusId, focusData.selection );
       * }
       * else {
       *   onContextualizeHyperlink( choosenResource, focusData.focusId, focusData.selection );
       * }
       */
    };
    const handleToggleDropdown = () => {
      this.setState( {
        dropdownOpen: !dropdownOpen,
      } );
    };
    const handleChooseSection = ( id ) => {
      this.setState( {
        selectedSectionId: id
      } );
    };

    const getInactiveSectionTitle = ( id ) => {
      const thatSection = inactiveSections.find( ( s ) => s.id === id );
      if ( thatSection ) {
        return thatSection.title;
      }
      return translate( 'No section' );
    };

    /*
     * const handleToggleExistingLinksDropDown = () => this.setState( { dropdownOpen: !dropdownOpen } );
     * const handleChooseResource = ( thatId ) => this.setState( { choosenResource: choosenResource === thatId ? undefined : thatId } );
     * const handleNewURLChange = ( e ) => this.setState( { url: e.target.value } );
     * const handleNewTitleChange = ( e ) => this.setState( { title: e.target.value } );
     */

    return (
      <ModalCard
        isActive={ isActive }
        headerContent={ translate( 'Add a link to another section' ) }
        onClose={ onClose }
        mainContent={
          <div>
            <StretchedLayoutContainer
              style={ { alignItems: 'center' } }
              isDirection={ 'horizontal' }
            >
              <StretchedLayoutItem>{translate( 'Link to section' )}</StretchedLayoutItem>
              <StretchedLayoutItem
                isFlex={ 1 }
                style={ { padding: '1rem' } }
              >
                <Dropdown
                  onToggle={ handleToggleDropdown }
                  isActive={ dropdownOpen }
                  closeOnChange
                  onChange={ handleChooseSection }
                  value={ { id: selectedSectionId } }
                  options={ inactiveSections
                              .filter( ( sectionMetadata ) => sectionMetadata )
                              .map( ( sectionMetadata ) => ( {
                              id: sectionMetadata.id,
                              label: (
                                <FlexContainer
                                  alignItems={ 'center' }
                                  flexDirection={ 'row' }
                                >
                                  <Image
                                    style={ { display: 'inline-block', marginRight: '1em' } }
                                    isSize={ '16x16' }
                                    src={ icons.section.black.svg }
                                  />
                                  <span >
                                    {`${sectionMetadata && sectionMetadata.title ? abbrevString( sectionMetadata.title, 30 ) : translate( 'No section' )}`}
                                  </span>
                                </FlexContainer>
                                )
                            } ) ) }
                >
                  {selectedSectionId ? abbrevString( `${getInactiveSectionTitle( selectedSectionId )}`, 60 ) : translate( 'Choose a section' )}
                </Dropdown>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          </div>
        }
        footerContent={ [
          <Button
            type={ 'submit' }
            isFullWidth
            key={ 0 }
            onClick={ handleConfirm }
            isDisabled={ !selectedSectionId }
            isColor={ 'primary' }
          >
            {translate( 'Add section link' )}
          </Button>,
          <Button
            onClick={ onClose }
            isFullWidth
            key={ 1 }
            isColor={ 'warning' }
          >{translate( 'Cancel' )}
          </Button>,
        ] }
      />
    );
  }
}

export default InternalLinkModal;
