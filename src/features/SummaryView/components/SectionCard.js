import React from 'react';
import PropTypes from 'prop-types';

import {SortableHandle} from 'react-sortable-hoc';

import {Link} from 'react-router-dom';

import config from '../../../config';

import {
  Card,
  Icon,
    StretchedLayoutContainer,
  StretchedLayoutItem,
} from 'quinoa-design-library/components/';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import {
  abbrevString,
  computeSectionFirstWords
} from '../../../helpers/misc';

const SectionCard = ({
  section,
  goTo,
  lockData,
  setSectionLevel,
  // minified,
  story,
  onDelete
}, {t}) => {

  const translate = translateNameSpacer(t, 'Components.SectionCard');

  const onAction = action => {
    switch (action) {
      case 'delete':
        onDelete(section.id);
        break;
      case 'higher':
        setSectionLevel({sectionId: section.id, level: section.metadata.level - 1});
        break;
      case 'lower':
        setSectionLevel({sectionId: section.id, level: section.metadata.level + 1});
        break;
      case 'edit':
      default:
        goTo(section.id);
        break;

    }
  };

  return (
    <Card
      title={
        <Link
          to={`/story/${story.id}/section/${section.id}`}
          data-tip={section.metadata.title}
          data-for="tooltip"
          data-place="bottom">
          <span>
            {abbrevString(section.metadata.title, 15)}
          </span></Link>}
      subtitle={section.metadata.subtitle}
      lockStatus={lockData ? 'locked' : 'open'}
      statusMessage={lockData ? translate('edited by {n}', {n: lockData.name}) : translate('open for edition')}
      onAction={onAction}
      bodyContent={<div style={{paddingLeft: '2.5rem'}}><i>{computeSectionFirstWords(section)}</i></div>}
      asideActions={[
        {
          label: translate('edit'),
          id: 'edit',
          isColor: 'primary',
          isDisabled: lockData
        }, {
          label: translate('move'),
          isColor: 'info',
          id: 'move',
          component: SortableHandle(() =>
            (<span style={{cursor: 'move'}} className="button is-fullwidth is-info">
              {translate('move')}
            </span>)
          )
        },
        {
          label: translate('delete'),
          isColor: 'danger',
          id: 'delete',
          isDisabled: lockData
        },

        // {
        //   label: translate('duplicate'),
        //   id: 'duplicate'
        // }
      ]}

      footerActions={[
        {
          label: (
            <StretchedLayoutContainer style={{alignItems: 'center', padding: '1rem'}} isAbsolute isDirection="horizontal">
              <StretchedLayoutItem>
                <Icon isSize="small" isAlign="left">
                  <span className="fa fa-chevron-left" aria-hidden="true" />
                </Icon>
              </StretchedLayoutItem>
              <StretchedLayoutItem isFlex={1}>
                {translate('higher level')}
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          ),
          isDisabled: section.metadata.level === 0,
          isColor: 'info',
          id: 'higher'
        },
        {
          label: (
            <StretchedLayoutContainer style={{alignItems: 'center', padding: '1rem'}} isAbsolute isDirection="horizontal">
              <StretchedLayoutItem isFlex={1}>
                {translate('lower level')}
              </StretchedLayoutItem>
              <StretchedLayoutItem>
                <Icon isSize="small" isAlign="left">
                  <span className="fa fa-chevron-right" aria-hidden="true" />
                </Icon>
              </StretchedLayoutItem>
            </StretchedLayoutContainer>
          ),
          isDisabled: section.metadata.level >= config.maxSectionLevel - 1,
          isColor: 'info',
          id: 'lower'
        }
      ]} />
  );
};

SectionCard.contextTypes = {
  t: PropTypes.func
};

export default SectionCard;
