import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Field,
  Label,
  Control,
  Dropdown,
  ColorPicker,
  StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import Range from 'quinoa-design-library/components/Range';
import { map, toPairs, sortBy, indexOf, debounce } from 'lodash/fp';
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { deref } from '../../../helpers/schemaUtils';

const RANGE_VALUE_FORMAT = 100;
const mapFollowOrder = ( f, obj, order ) => map(
  ( [ key, value ] ) => f( value, key ),
  sortBy(
    ( [ key ] ) => indexOf( key, order ),
    toPairs( obj )
  )
);

const SizeClass = ( props, { t } ) => {
  const translate = translateNameSpacer( t, 'Features.DesignView.StylesVariables' );
  const options = map( ( d ) => ( { id: d, label: translate( d ) } ), props.options.enum );
  const [ showDropdown, setShowDropdown ] = useState( false );
  const [ value, setValue ] = useState(
    () => options.find( ( option ) => option.id === props.value )
  );
  const onToggle = () => setShowDropdown( !showDropdown );
  const onDropdownChange = ( val ) => {
    props.onChange( val );
    setValue(
      options.find( ( option ) => option.id === val )
    );
  };

  return (
    <Dropdown
      isFullWidth
      onToggle={ onToggle }
      isActive={ showDropdown }
      onChange={ onDropdownChange }
      value={ value }
      options={ options }
    />
  );
};

SizeClass.contextTypes = {
  t: PropTypes.func
};

const Wysiwyg = ( {
  options,
  styles,
  onChange
}, { t } ) => {
  const translate = translateNameSpacer( t, 'Features.DesignView.StylesVariables' );
  const onSizeClassChange = ( value ) =>
    onChange( {
      ...styles,
      sizeClass: value
    } );
  const onColorChange = ( value ) =>
    onChange( {
      ...styles,
      color: value
    } );
  const onOpacityChange = debounce( 200, ( value ) =>
    onChange( {
      ...styles,
      opacity: value / RANGE_VALUE_FORMAT
    } )
  );

  const { sizeClass, color, opacity } = options.properties;

  if ( !sizeClass && !opacity && color ) {
    return (
      <StretchedLayoutContainer
        isDirection={ 'horizontal' }
        isOverflowVisible
        style={ { margin: '1rem 0' } }
      >
        <StretchedLayoutItem
          isFlex={ 1 }
          style={ { alignSelf: 'center' } }
        >
          <Label>{translate( options.description )}</Label>
        </StretchedLayoutItem>
        <StretchedLayoutItem>
          <Field hasAddons>
            <ColorPicker
              color={ styles.color }
              onChange={ onColorChange }
            />
          </Field>
        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    );
  }

  if ( sizeClass && color ) {
    return (
      <React.Fragment>
        <Field>
          <Control>
            <Label>{translate( options.description )}</Label>
            <StretchedLayoutContainer
              isDirection={ 'horizontal' }
              isOverflowVisible
            >
              <StretchedLayoutItem isFlex={ 1 }>
                <SizeClass
                  value={ styles.sizeClass }
                  options={ options.properties.sizeClass }
                  onChange={ onSizeClassChange }
                />
              </StretchedLayoutItem>
              <StretchedLayoutItem>
                <ColorPicker
                  color={ styles.color }
                  onChange={ onColorChange }
                />
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          </Control>
        </Field>
        {opacity &&
          <Field>
            <Control>
              <Label>{translate( 'Define background opacity' )}</Label>
              <StretchedLayoutContainer isOverflowVisible>
                <StretchedLayoutItem>
                  <Range
                    min={ options.properties.opacity.minimum * RANGE_VALUE_FORMAT }
                    max={ options.properties.opacity.maximum * RANGE_VALUE_FORMAT }
                    defaultValue={ styles.opacity * RANGE_VALUE_FORMAT || options.properties.opacity.default * RANGE_VALUE_FORMAT }
                    onChange={ onOpacityChange }
                  />
                </StretchedLayoutItem>
              </StretchedLayoutContainer>
            </Control>
          </Field>
        }
      </React.Fragment>
    );
  }

  return <div />;
};

Wysiwyg.contextTypes = {
  t: PropTypes.func,
};

const StyleEditor = ( { styles, options, onChange } ) => (
  <form>
    {mapFollowOrder( ( option, key ) => (
      <Wysiwyg
        key={ key }
        styles={ styles[key] }
        options={ option }
        title={ key }
        onChange={ ( style ) => {
          onChange( {
            ...styles,
            [key]: style
          } );
        } }
      />
    ),
    deref( options ),
    [ 'background', 'coverText', 'titles', 'corpus', 'blockquotes', 'links' ]
  )}
  </form>
);

export default StyleEditor;
