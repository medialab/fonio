import React from 'react';
import PropTypes from 'prop-types';

import ReactTooltip from 'react-tooltip';

import {translateNameSpacer} from '../../../helpers/translateUtils';


import {
  Button,
  Card,
  Column,
  Columns,
  StatusMarker,
  Icon,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import {Link} from 'react-router-dom';


const SectionMiniCard = ({
  section,
  storyId,
  onDeleteSection,
  onOpenSettings
}, {t}) => {
  const translate = translateNameSpacer(t, 'Features.SectionView');
  const lockStatusMessage = () => {
    switch (section.lockStatus) {
      case 'active':
        return translate('edited by you');
      case 'locked':
        return translate('edited by {a}', {a: section.lockData.name});
      case 'open':
      default:
        return translate('open to edition');
    }
  };

  const cardStyle = {
    pointerEvents: section.lockStatus === 'locked' ? 'none' : 'all'
  };

  return (
    <Card
      bodyContent={
        <div>
          <Columns>
            <Column isSize={2}>
              <Icon isSize="medium" isAlign="left">
                <img src={icons.section.black.svg} />
              </Icon>
            </Column>

            <Column isSize={8}>
              {
                section.lockStatus !== 'active' &&
                <Link style={cardStyle} to={`/story/${storyId}/section/${section.id}`}>{section.metadata.title}</Link>
              }
              {section.lockStatus === 'active' &&
              <b>{section.metadata.title}</b>
              }
            </Column>

            <Column isSize={2}>
              <StatusMarker
                lockStatus={section.lockStatus}
                statusMessage={lockStatusMessage()} />
            </Column>
          </Columns>
          <Columns>
            <Column isOffset={2} isSize={10}>
              <Button
                data-for="card-action"
                data-tip={translate('drag to change section order')}
                style={{cursor: 'pointer', pointerEvents: 'none'}}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.move.black.svg} />
                </Icon>
              </Button>
              <Button
                onClick={onOpenSettings}
                isDisabled={section.lockStatus !== 'active'}
                data-for="card-action"
                data-tip={translate('section settings')}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.settings.black.svg} />
                </Icon>
              </Button>
              <Button
                onClick={onDeleteSection}
                isDisabled={section.lockStatus === 'locked' || section.lockStatus === 'active'}
                data-for="card-action"
                data-tip={translate('delete this section')}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.remove.black.svg} />
                </Icon>
              </Button>

            </Column>
            <ReactTooltip
              place="right"
              effect="solid"
              id="card-action" />
          </Columns>
        </div>
      } />
  );
};

SectionMiniCard.contextTypes = {
  t: PropTypes.func,
};

export default SectionMiniCard;
