import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Image
} from 'quinoa-design-library/components';

import {translateNameSpacer} from '../../helpers/translateUtils';

import icons from 'quinoa-design-library/src/themes/millet/icons';


const NoteButton = ({
  onClick,
  active
}, {t}) => {
  const translate = translateNameSpacer(t, 'Component.SectionEditor');
  const onMouseDown = event => event.preventDefault();
  return (
    <Button
      isRounded
      isColor={active && 'info'}
      onClick={onClick}
      onMouseDown={onMouseDown}
      data-tip={translate('add a footnote')}>
      <Image isSize={'16x16'} src={icons.note.black.svg} />
    </Button>
  );
};


NoteButton.contextTypes = {
  t: PropTypes.func
};

export default NoteButton;
