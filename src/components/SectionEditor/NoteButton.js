import React from 'react';
import PropTypes from 'prop-types';

import { translateNameSpacer } from '../../helpers/translateUtils';
import { silentEvent } from '../../helpers/misc';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import IconBtn from '../IconBtn';

const NoteButton = ( {
  onClick,
  active
}, { t } ) => {
  const translate = translateNameSpacer( t, 'Components.SectionEditor' );
  const handleMouseDown = ( event ) => {
    silentEvent( event );
  };
  return (
    <IconBtn
      isColor={ active && 'info' }
      onClick={ onClick }
      onMouseDown={ handleMouseDown }
      dataTip={ translate( 'add a footnote (shortcut : cmd + m)' ) }
      src={ icons.note.black.svg }
    />
  );
};

NoteButton.contextTypes = {
  t: PropTypes.func
};

export default NoteButton;
