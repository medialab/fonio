import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Column, Level, Field, Label, Control, Dropdown, ColorPicker } from 'quinoa-design-library/components/';
import { translateNameSpacer } from '../../../helpers/translateUtils';

const StyleEditor = ( props, { t } ) => {
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
  const [ showDropdown, setShowDropdown ] = useState( false );
  const [ titleSize, setTitleSize ] = useState( options[2] );
  const [ titleColor, setTitleColor ] = useState( undefined );
  const onChangeSize = ( size ) =>
    setTitleSize( options.find( ( { id } ) => id === size ) );

  const onToggle = () => setShowDropdown( !showDropdown );

  return (
    <Column>
      <Level>
        <form>
          <Field>
            <Control>
              <Label style={ { color: titleColor } }>Taille de titres</Label>
              <Dropdown
                onToggle={ onToggle }
                isActive={ showDropdown }
                onChange={ onChangeSize }
                value={ titleSize }
                options={ options }
              />
              <ColorPicker onChange={ setTitleColor } />
            </Control>
          </Field>
        </form>
      </Level>
    </Column>
  );
};

StyleEditor.contextTypes = {
  t: PropTypes.func,
};

export default StyleEditor;
