import React from 'react';
import PropTypes from 'prop-types';

import {
  ModalCard,
} from 'quinoa-design-library/components/';


import {translateNameSpacer} from '../../helpers/translateUtils';


const UploadModal = ({
  editorPastingStatus = {}
}, {t}) => {
  const translate = translateNameSpacer(t, 'Components.PastingModal');
  const {statusParameters = {}} = editorPastingStatus;
  let message;
  switch (editorPastingStatus.status) {
    case 'duplicating-contents':
      message = translate('Duplicating contents');
      break;
    case 'updating-contents':
      message = translate('Updating contents');
      break;
    case 'converting-contents':
      message = translate('Converting contents');
      break;
    case 'duplicating-contextualizers':
      message = translate('Duplicating {n} contextualizers', {n: statusParameters.length});
      break;
    case 'duplicating-notes':
      message = translate('Duplicating {n} notes', {n: statusParameters.length});
      break;
    case 'creating-resources':
      message = translate('Creating {n} items', {n: statusParameters.length});
      break;
    case 'attaching-contextualizers':
      message = translate('Attaching {n} contextualizers', {n: statusParameters.length});
      break;

    default:
    break;
  }
  return (
    <ModalCard
      isActive={editorPastingStatus.status !== undefined}
      headerContent={translate('Please wait...')}
      mainContent={
        <div>
          {message && <p>
            {message}
          </p>}
        </div>
    } />
  );
};

UploadModal.contextTypes = {
  t: PropTypes.func,
};

export default UploadModal;
