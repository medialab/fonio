/**
 * This module provides a modal for exporting a story
 * @module fonio/components/ExportModal
 */
/**
 * Imports Libraries
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Column,
  ModalCard,
  BigSelect,
  Notification,
  StretchedLayoutContainer,
  HelpPin,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { translateNameSpacer } from '../../helpers/translateUtils';

const ExportModal = ( {
  activeOptionId,
  onClose,
  onChange,
  status,
  isActive
}, { t } ) => {

  const translate = translateNameSpacer( t, 'Components.ExportModal' );

  return (
    <ModalCard
      isActive={ isActive }
      headerContent={ translate( 'Export story' ) }
      onClose={ onClose }
      style={{width: '70vw'}}
      mainContent={
        <StretchedLayoutContainer isDirection={ 'vertical' }>
          <StretchedLayoutItem isFlex={ 1 }>
            <Column>
              <BigSelect
                activeOptionId={ activeOptionId }
                onChange={ onChange }
                columns={3}
                boxStyle={ { minHeight: '12rem', textAlign: 'center' } }
                options={ [
                    {
                      id: 'html-multi',
                      label: <span><span>{translate( 'Export your story to publish it' )}</span><HelpPin>{translate('multiple-html-help')}</HelpPin></span>,
                      iconUrl: activeOptionId === 'html-multi' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                    }, 
                    {
                      id: 'html-single',
                      label: <span><span>{translate( 'Export your story to archive it' )}</span><HelpPin>{translate('single-html-help')}</HelpPin></span>,
                      iconUrl: activeOptionId === 'html-single' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                    },
                    {
                      id: 'json',
                      label: <span><span>{translate( 'Export your story to backup it' )}</span><HelpPin>{translate('json-help')}</HelpPin></span>,
                      iconUrl: activeOptionId === 'json' ? icons.takeAway.white.svg : icons.takeAway.black.svg
                    }
                  ] }
              />
            </Column>
          </StretchedLayoutItem>
          {status === 'success' &&
          <StretchedLayoutItem>
            <Notification isColor={ 'success' }>
              {translate( 'Story was bundled successfully' )}
            </Notification>
          </StretchedLayoutItem>
            }
        </StretchedLayoutContainer>
      }
    />
  );
};

ExportModal.contextTypes = {
  t: PropTypes.func,
};

export default ExportModal;

