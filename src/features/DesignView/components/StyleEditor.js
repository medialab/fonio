import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Field, Label, Control, Dropdown, ColorPicker } from 'quinoa-design-library/components/';
import { translateNameSpacer } from '../../../helpers/translateUtils';

const StyleEditor = ( { styles = {
  titles: {
    sizeClass: 'normal',
    color: '#000'
  }
}, onChange }, { t } ) => {
  const translate = translateNameSpacer( t, 'Features.DesignView.StylesVariables' );
  const options = [
    {
      id: 'smaller',
      label: translate( 'smaller' ),
    }, {
      id: 'small',
      label: translate( 'small' ),
    }, {
      id: 'normal',
      label: translate( 'normal' ),
    }, {
      id: 'big',
      label: translate( 'big' ),
    }, {
      id: 'bigger',
      label: translate( 'bigger' ),
    }
  ];
  const findStitleSizeClass = ( size ) => options.find( ( { id } ) => id === size );
  const [ showDropdown, setShowDropdown ] = useState( false );

  const onChangeSize = ( size ) =>
    onChange( {
      ...styles,
      titles: {
        ...styles.titles,
        sizeClass: size
      }
    } );

  const onChangeColor = ( color ) =>
    onChange( {
      ...styles,
      titles: {
        ...styles.titles,
        color,
      }
    } );

  const onToggle = () => setShowDropdown( !showDropdown );

  return (
    <form>
      <Field>
        <Control>
          <Label style={ { color: styles.titles.color } }>Taille de titres</Label>
          <Dropdown
            onToggle={ onToggle }
            isActive={ showDropdown }
            onChange={ onChangeSize }
            value={ findStitleSizeClass( styles.titles.sizeClass ) || options[2] }
            options={ options }
          />
          <span style={ { zIndex: 100, position: 'relative' } }>
            <ColorPicker
              color={ styles.titles.color }
              onChange={ onChangeColor }
            />
          </span>
        </Control>
      </Field>
    </form>
  );
};

StyleEditor.contextTypes = {
  t: PropTypes.func,
};

export default StyleEditor;
