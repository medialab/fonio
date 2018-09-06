import React from 'react';
import PropTypes from 'prop-types';

import {SortableHandle} from 'react-sortable-hoc';

import {Link} from 'react-router-dom';

import config from '../../../config';

import {
  Button,
  Card,
  Icon,
  StatusMarker,
  Columns,
  Column,
  Title,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import {translateNameSpacer} from '../../../helpers/translateUtils';
import MovePad from '../../../components/MovePad';

import {
  abbrevString,
  computeSectionFirstWords
} from '../../../helpers/misc';

const SectionCard = ({
  section,
  goTo,
  lockData,
  setSectionLevel,
  sectionIndex,
  maxSectionIndex,
  // minified,
  story,
  onDelete,
  setSectionIndex,
}, {t}) => {


  const translate = translateNameSpacer(t, 'Components.SectionCard');

  const onAction = (action, event) => {
    event.stopPropagation();
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

  const onClick = e => {
    e.stopPropagation();
    if (!lockData) {
      goTo(section.id);
    }
  };

  const lockStatusMessage = () => {
    if (lockData) {
      return translate('edited by {a}', {a: lockData.name});
    }
 else {
      return translate('open to edition');
    }
  };

  const MAX_TITLE_LEN = 15;

  const sectionTitle = (<span
    data-for="tooltip"
    data-place="right"
    data-html
    data-tip={`<div class="content"><h5 style="color: white">${section.metadata.title}</h5><p>${computeSectionFirstWords(section)}</p></div>`}>
    {abbrevString(section.metadata.title || translate('Untitled section'), MAX_TITLE_LEN)}
  </span>);

  const titleSize = 5;

  return (
    <div style={{cursor: 'pointer'}} onClick={onClick}>
      <Card
        onAction={onAction}
        bodyContent={
          <div>
            <Columns style={{marginBottom: 0}}>
              <Column style={{paddingBottom: 0}} isSize={1}>
                <Icon isSize="medium" isAlign="left">
                  <img src={icons.section.black.svg} />
                </Icon>
              </Column>

              <Column style={{paddingBottom: 0}} isSize={7}>
                {
                    lockData === undefined &&
                    <Title isSize={titleSize}>
                      <Link
                        to={`/story/${story.id}/section/${section.id}`}
                        data-tip={section.metadata.title.length > MAX_TITLE_LEN ? section.metadata.title : undefined}
                        data-for="tooltip"
                        data-place="bottom">
                        <span>
                          {abbrevString(section.metadata.title || translate('Untitled section'), 30)}
                        </span>
                      </Link>
                      <StatusMarker
                        style={{marginLeft: '1rem'}}
                        lockStatus={lockData ? 'locked' : 'open'}
                        statusMessage={lockStatusMessage()} />
                    </Title>
                  }
                {lockData !== undefined &&
                  <Title isSize={titleSize}>
                    <span
                      data-tip={section.metadata.title.length > MAX_TITLE_LEN ? undefined : section.metadata.title}
                      data-for="tooltip"
                      data-place="bottom">
                      {sectionTitle}
                    </span>
                    <StatusMarker
                      style={{marginLeft: '1rem'}}
                      lockStatus={lockData ? 'locked' : 'open'}
                      statusMessage={lockStatusMessage()} />
                  </Title>
                  }
              </Column>
            </Columns>
            <Columns>
              <Column isOffset={1} isSize={7}>
                <i>{computeSectionFirstWords(section)}</i>
                <div style={{marginTop: '1rem'}}>
                  <Button
                    onClick={(e) => onAction('edit', e)}
                    isDisabled={lockData !== undefined}
                    data-effect="solid"
                    data-place="left"
                    data-for="tooltip"
                    data-tip={lockData === undefined && translate('edit section')}>
                    <Icon isSize="small" isAlign="left">
                      <img src={icons.edit.black.svg} />
                    </Icon>
                  </Button>
                  <Button
                    onClick={(e) => onAction('delete', e)}
                    isDisabled={lockData !== undefined}
                    data-effect="solid"
                    data-place="left"
                    data-for="tooltip"
                    data-tip={lockData === undefined && translate('delete this section')}>
                    <Icon isSize="small" isAlign="left">
                      <img src={icons.remove.black.svg} />
                    </Icon>
                  </Button>
                </div>
              </Column>
              <Column style={{position: 'relative'}} isSize={2}>
                <MovePad
                  style={{
                      position: 'absolute',
                      top: '-3rem',
                      right: '1rem'
                    }}
                  chevronsData={{
                      left: {
                        tooltip: translate('Title level {n}', {n: section.metadata.level}),
                        isDisabled: section.metadata.level === 0,
                        onClick: () => setSectionLevel({sectionId: section.id, level: section.metadata.level - 1})
                      },
                      right: {
                        tooltip: translate('Title level {n}', {n: section.metadata.level + 2}),
                        isDisabled: section.metadata.level >= config.maxSectionLevel - 1,
                        onClick: () => setSectionLevel({sectionId: section.id, level: section.metadata.level + 1})
                      },
                      up: {
                        isDisabled: sectionIndex === 0,
                        tooltip: translate('Move up in the summary'),
                        onClick: () => setSectionIndex(sectionIndex, sectionIndex - 1)
                      },
                      down: {
                        isDisabled: sectionIndex === maxSectionIndex,
                        tooltip: translate('Move down in the summary'),
                        onClick: () => setSectionIndex(sectionIndex, sectionIndex + 1)
                      }
                    }}
                  moveComponentToolTip={translate('Move section in summary')}
                  MoveComponent={SortableHandle(() =>
                      (<span
                        onClick={e => {
e.preventDefault(); e.stopPropagation();
}}
                        onMouseUp={e => {
e.preventDefault(); e.stopPropagation();
}}
                          // onMouseDown={e => {e.preventDefault(); e.stopPropagation()}}
                        style={{cursor: 'move'}}
                        className="button">
                        <Icon icon={'arrows-alt'} />
                      </span>)
                    )} />
              </Column>
            </Columns>
          </div>
        } />
    </div>
  );
};

SectionCard.contextTypes = {
  t: PropTypes.func
};

export default SectionCard;
