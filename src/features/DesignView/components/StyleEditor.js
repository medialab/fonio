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

const sizeClassToDropdown = map( ( d ) => ( { id: d, label: d } ) );
const RANGE_VALUE_FORMAT = 100;

const SizeClass = ( props ) => {
  const options = sizeClassToDropdown( props.options.enum );
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

const triggerDebounce = ( debouncedCallback ) =>
  ( value ) =>
    debouncedCallback( value );

const Wysiwig = ( {
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

  let elements = <div />;

  if ( !sizeClass && !opacity && color ) {
    elements = (
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
    elements = (
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
                    onChange={ triggerDebounce( onOpacityChange ) }
                  />
                </StretchedLayoutItem>
              </StretchedLayoutContainer>
            </Control>
          </Field>
        }
      </React.Fragment>
    );
  }

  return elements;
};

Wysiwig.contextTypes = {
  t: PropTypes.func,
};

const mapFollowOrder = ( f, obj, order ) => map(
  ( [ key, value ] ) => f( value, key ),
  sortBy(
    ( [ key ] ) => indexOf( key, order ),
    toPairs( obj )
  )
);

const StyleEditor = ( { styles, options, onChange } ) => {
  options = deref( options );
  return (
    <form>
      {mapFollowOrder( ( option, key ) => (
        <Wysiwig
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
      options,
      [ 'background', 'coverText', 'titles', 'corpus', 'blockquotes', 'links' ]
    )}
    </form>
  );
};

export default StyleEditor;
