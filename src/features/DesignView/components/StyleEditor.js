import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Field, Label, Control, Dropdown, ColorPicker } from 'quinoa-design-library/components/';
import { map as cappedMap } from 'lodash/fp';
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

  const onSizeClassChange = ( value ) => {
    console.log( value );
  };

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
        {options.color &&
          <ColorPicker
            color={ styles.color }
            onChange={ onChange }
          />}
      </Control>
    </Field>
  );
};

Wysiwig.contextTypes = {
  t: PropTypes.func,
};

const StyleEditor = ( { styles, options } ) => {
  options = deref( options );

  /*
   * const onChangeSize = ( size ) =>
   *   onChange( {
   *     ...styles,
   *     titles: {
   *       ...styles.titles,
   *       sizeClass: size
   *     }
   *   } );
   */

  /*
   * const onChangeColor = ( color ) =>
   *   onChange( {
   *     ...styles,
   *     titles: {
   *       ...styles.titles,
   *       color,
   *     }
   *   } );
   */

  return (
    <form>
      {map( ( option, key ) => (
        <Wysiwig
          key={ key }
          styles={ styles[key] }
          options={ option }
          title={ key }
        />
      ), options )}
    </form>
  );

  /*
   * return (
   *   <form>
   *     <Field>
   *       <Control>
   *         <Label style={ { color: styles.titles.color } }>Taille de titres</Label>
   *         <Dropdown
   *           onToggle={ onToggle }
   *           isActive={ showDropdown }
   *           onChange={ onChangeSize }
   *           value={ findStitleSizeClass( styles.titles.sizeClass ) || options[2] }
   *           options={ options }
   *         />
   *         <span style={ { zIndex: 100, position: 'relative' } }>
   *           <ColorPicker
   *             color={ styles.titles.color }
   *             onChange={ onChangeColor }
   *           />
   *         </span>
   *       </Control>
   *     </Field>
   *   </form>
   * );
   */
};

export default StyleEditor;
