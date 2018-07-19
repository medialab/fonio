import React from 'react';
import PropTypes from 'prop-types';

import config from '../../../config';

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
  onOpenSettings,
  setSectionLevel,
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

  const onHigher = () => {
    setSectionLevel({sectionId: section.id, level: section.metadata.level - 1});
  };
  const onLower = () => {
    setSectionLevel({sectionId: section.id, level: section.metadata.level + 1});
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
                data-tip={translate('drag to change section order')}
                data-effect="solid"
                data-place="left"
                style={{cursor: 'pointer', pointerEvents: 'none'}}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.move.black.svg} />
                </Icon>
              </Button>
              <Button
                onClick={onOpenSettings}
                isDisabled={section.lockStatus !== 'active'}
                data-effect="solid"
                data-place="left"
                data-tip={translate('section settings')}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.settings.black.svg} />
                </Icon>
              </Button>
              <Button
                onClick={onDeleteSection}
                isDisabled={section.lockStatus === 'locked' || section.lockStatus === 'active'}
                data-effect="solid"
                data-place="left"
                data-tip={translate('delete this section')}>
                <Icon isSize="small" isAlign="left">
                  <img src={icons.remove.black.svg} />
                </Icon>
              </Button>

              <Button
                onClick={onHigher}
                isDisabled={section.metadata.level <= 0}
                data-effect="solid"
                data-place="left"
                data-tip={translate('higher level of importance')}>
                <Icon isSize="small" isAlign="left">
                  <span className="fa fa-chevron-left" aria-hidden="true" />
                </Icon>
              </Button>
              <Button
                onClick={onLower}
                isDisabled={section.metadata.level >= config.maxSectionLevel - 1}
                data-effect="solid"
                data-place="left"
                data-tip={translate('lower level of importance')}>
                <Icon isSize="small" isAlign="left">
                  <span className="fa fa-chevron-right" aria-hidden="true" />
                </Icon>
              </Button>

            </Column>
          </Columns>
        </div>
      } />
  );
};

SectionMiniCard.contextTypes = {
  t: PropTypes.func,
};

export default SectionMiniCard;
