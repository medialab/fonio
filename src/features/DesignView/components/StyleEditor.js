import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Field, Label, Control, Dropdown, ColorPicker } from 'quinoa-design-library/components/';
import { map as cappedMap, toPairs, sortBy, indexOf } from 'lodash/fp';
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { deref } from '../../../helpers/schemaUtils';

const map = cappedMap.convert( { cap: false } );

const sizeClassToDropdown = cappedMap( ( d ) => ( { id: d, label: d } ) );

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
      onToggle={ onToggle }
      isActive={ showDropdown }
      onChange={ onDropdownChange }
      value={ value }
      options={ options }
    />
  );
};

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

  return (
    <Field>
      <Control>
        <Label>{translate( options.description )}</Label>
        {options.properties.sizeClass &&
          <SizeClass
            value={ styles.sizeClass }
            options={ options.properties.sizeClass }
            onChange={ onSizeClassChange }
          />
        }
        {options.properties.color &&
          <ColorPicker
            color={ styles.color }
            onChange={ onColorChange }
          />}
      </Control>
    </Field>
  );
};

Wysiwig.contextTypes = {
  t: PropTypes.func,
};

const mapFollowOrder = ( f, obj, order ) => map(
  ( [ key, value ] ) => f( value, key ), sortBy(
    ( [ key ] ) => indexOf( key, order ), toPairs( obj )
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
