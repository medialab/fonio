import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Field, Label, Control, Dropdown, ColorPicker } from 'quinoa-design-library/components/';
import { mapObjIndexed, values } from 'ramda';
import { translateNameSpacer } from '../../../helpers/translateUtils';
import { deref } from '../../../helpers/schemaUtils';

const Wysiwig = ( {
  options,
  title,
  styles,
  onChange
}, { t } ) => {
  const [ showDropdown, setShowDropdown ] = useState( false );
  const onToggle = () => setShowDropdown( !showDropdown );
  const findStitleSizeClass = ( size ) => options.find( ( { id } ) => id === size );

  const translate = translateNameSpacer( t, 'Features.DesignView.StylesVariables' );
  return (
    <Field>
      <Control>
        <Label>{translate( title )}</Label>
        {options.sizeClass &&
          <Dropdown
            onToggle={ onToggle }
            isActive={ showDropdown }
            onChange={ onChange }
            value={ findStitleSizeClass( styles.titles.sizeClass ) || options[2] }
            options={ options }
          />
        }
        {options.color && <ColorPicker
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

const StyleEditor = ( { styles = {
  titles: {
    sizeClass: 'normal',
    color: '#000'
  }
}, options } ) => {

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

  const childs = mapObjIndexed( ( option, key ) => (
    <Wysiwig
      key={ key }
      styles={ styles[key] }
      options={ option }
      title={ key }
    />
  ), options );
  return (
    <form>
      {values( childs )}
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
