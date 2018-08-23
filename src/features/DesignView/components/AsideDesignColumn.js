import React from 'react';
import PropTypes from 'prop-types';

import {templates} from 'quinoa-story-player';

import resourceSchema from 'quinoa-schemas/resource';

import {
  Button,
  // Box,
  // Checkbox,
  // ColorPicker,
  CodeEditor,
  Column,
  // Content,
  Collapsable,
  Control,
  Dropdown,
  Field,
  // Input,
  Image,
  // Help,
  Label,
  Level,
  Select,
  Tab,
  TabLink,
  TabList,
  Title,
  Tabs,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  // Title,
} from 'quinoa-design-library/components/';

import icons from 'quinoa-design-library/src/themes/millet/icons';

import {translateNameSpacer} from '../../../helpers/translateUtils';

const resourceTypes = Object.keys(resourceSchema.definitions).filter(t => t !== 'glossary');

const AsideDesignColumn = ({
  designAsideTabCollapsed,
  designAsideTabMode,
  stylesMode = 'code',
  story = {},
  style = {},

  setDesignAsideTabCollapsed,
  setDesignAsideTabMode,

  onUpdateCss,
  onUpdateSettings,

  referenceTypesVisible,
  setReferenceTypesVisible,

  setCssHelpVisible,

}, {t}) => {
  const translate = translateNameSpacer(t, 'Features.DesignView');
  const {settings = {}} = story;
  const {options = {}} = settings;

  const template = templates.find(thatTemplate => thatTemplate.id === story.settings.template);
  const templateOptions = template.acceptsOptions || [];

  const onOptionChange = (key, value) => {
    onUpdateSettings({
      ...settings,
      options: {
        ...settings.options,
        [key]: value
      }
    });
  };

  const updateReferenceTypes = type => {
    const referenceTypes = options.referenceTypes || [];
    let newReferenceTypes;
    if (referenceTypes.indexOf(type) === -1) {
      newReferenceTypes = [...referenceTypes, type];
    }
    else {
      newReferenceTypes = referenceTypes.filter(thatType => thatType !== type);
    }
    onOptionChange('referenceTypes', newReferenceTypes);
  };


  const renderAsideContent = () => {
    if (designAsideTabCollapsed) {
      return null;
    }
    switch (designAsideTabMode) {
      case 'settings':
        return (
          <Column>
            {/*<Level>
                          <form>
                            <Field>
                              <Label>Citation style</Label>
                              <Box>
                                <Title isSize={5}>
                                      APA
                                </Title>
                                <Help>Example:</Help>
                                <Content isSize={'small'}>
                                    Ricci, D., de Mourat, R., Leclercq, C., & Latour, B. (2015). Clues. Anomalies. Understanding. <i>Visible Language</i>, 49(3).
                                </Content>
                              </Box>
                            </Field>
                          </form>
                        </Level>*/}
            {
              templateOptions.indexOf('notesPosition') > -1 &&
              <Level>
                <form>
                  <Field>
                    <Label>{translate('Notes position')}</Label>
                    <Control>
                      <Select onChange={e => onOptionChange('notesPosition', e.target.value)} value={options.notesPosition}>
                        <option value="aside" >{translate('side notes')}</option>
                        <option value="foot">{translate('foot notes')}</option>
                      </Select>
                    </Control>
                  </Field>
                </form>
              </Level>
            }
            {
              templateOptions.indexOf('referenceTypes') > -1 &&
              <Level>
                <form>
                  <Field>
                    <Label>{translate('What types of items to show in references')}</Label>
                    <Control>
                      <Dropdown
                        onToggle={() => setReferenceTypesVisible(!referenceTypesVisible)}
                        isActive={referenceTypesVisible}
                        closeOnChange={false}
                        onChange={updateReferenceTypes}
                        value={(story.settings.options && story.settings.options.referenceTypes) || ['bib']}
                        options={resourceTypes.map(type => ({
                                id: type,
                                label: <span style={{display: 'flex', flexFlow: 'row nowrap', alignItems: 'center'}}><Image style={{display: 'inline-block', marginRight: '1em'}} isSize={'16x16'} src={icons[type].black.svg} /><span>{translate(type)}</span></span>
                              }))}>
                        {translate('Choose item types')}
                      </Dropdown>
                    </Control>
                  </Field>
                </form>
              </Level>
            }
            {
              templateOptions.indexOf('referenceStatus') > -1 &&
              <Level>
                <form>
                  <Field>
                    <Label>{translate('What items to show in references')}</Label>
                    <Control>
                      <Select onChange={e => onOptionChange('referenceStatus', e.target.value)} value={options.referenceStatus}>
                        <option value="cited">{translate('cited items only')}</option>
                        <option value="all">{translate('all items')}</option>
                      </Select>
                    </Control>
                  </Field>
                </form>
              </Level>
            }
          </Column>
        );
      case 'styles':
      default:
        return (
          <Column>
            {/*<Collapsable maxHeight={900} paddingBottom={'5rem'} isCollapsed={stylesMode === 'code'}>
              <form>
                <Field>
                  <Label>Text size:</Label>
                  <Dropdown
                    onToggle={() => console.log('set active size')}
                    isActive={false}
                    value={{id: 1, label: '1 rem'}}
                    options={[1, 2, 3, 4].map(id => ({id, label: id + ' rem'}))}>
                    <Input
                      value={'1.1rem'} />
                  </Dropdown>
                </Field>
                <Field>
                  <Label>Titles size:</Label>
                  <Dropdown
                    value={{id: 1, label: '1 rem'}}
                    options={[1, 2, 3, 4].map(id => ({id, label: id + ' rem'}))}>
                    <Input
                      value={'1.1rem'} />
                  </Dropdown>
                </Field>
                <Field>
                  <Label>List styles:</Label>
                  <Control>
                    <Select value={'3rem'}>
                      <option>chevron</option>
                      <option>bullet</option>
                      <option>dash</option>
                      <option>star</option>
                    </Select>
                  </Control>
                </Field>
                <Field>
                  <Label>Background color:</Label>
                  <Level>
                    <ColorPicker
                      edited={false}
                      color={'#32FF'}
                      onEdit={() => console.log('edit background color')} />
                    <Input value={'#32FF'} />
                  </Level>
                </Field>
                <Field>
                  <Label>Figures margin</Label>
                  <Control>
                    <Select value={'same as content'}>
                      <option>same as content</option>
                      <option>full width</option>
                    </Select>
                  </Control>
                </Field>
              </form>
            </Collapsable>*/}
            {stylesMode !== 'code' && <Level />}
            {/**<Button
              isFullWidth
              isColor={stylesMode === 'gui' ? '' : 'primary'}
            >
              {translate('Edit css (advanced)')}
            </Button>*/}
            <Title isSize={3}>
              {translate('Edit style with css')}
            </Title>
            {stylesMode === 'code' && <Level />}
            <Collapsable isCollapsed={stylesMode !== 'code'}>
              <Column>
                <CodeEditor
                  value={story.settings.css}
                  onChange={onUpdateCss} />
              </Column>
              <Column>
                <Button isFullWidth onClick={() => setCssHelpVisible(true)}>
                  {translate('Help')}
                </Button>
              </Column>
            </Collapsable>
          </Column>
        );
    }
  };

  return (
    <Column
      style={style} className="is-hidden-mobile aside-design-container" isSize={designAsideTabCollapsed ? 1 : '1/4'}
      isWrapper>
      <StretchedLayoutContainer isDirection="vertical" isAbsolute>
        <StretchedLayoutItem>
          <Column>
            <Tabs isBoxed isFullWidth style={{overflow: 'hidden'}}>
              <TabList>
                {
                  !designAsideTabCollapsed &&
                  <Tab onClick={() => setDesignAsideTabMode('settings')} isActive={designAsideTabMode === 'settings'}>
                    <TabLink>{translate('Settings')}</TabLink>
                  </Tab>
                }
                {
                  !designAsideTabCollapsed &&
                  'collapse' &&
                  <Tab onClick={() => setDesignAsideTabMode('styles')} isActive={designAsideTabMode === 'styles'}>
                    <TabLink>
                      {translate('Styles')}
                    </TabLink>
                  </Tab>
                }
                <Tab
                  className="is-hidden-mobile"
                  onClick={() => setDesignAsideTabCollapsed(!designAsideTabCollapsed)}
                  isActive={designAsideTabCollapsed}>
                  <TabLink
                    style={{
                          boxShadow: 'none',
                          transform: designAsideTabCollapsed ? 'rotate(180deg)' : undefined,
                          transition: 'all .5s ease'
                        }}
                    data-for="tooltip"
                    data-effect="solid"
                    data-place="right"
                    data-tip={designAsideTabCollapsed ? translate('show settings pannels') : translate('hide settings pannels')}>
                      ◀
                  </TabLink>
                </Tab>
              </TabList>
            </Tabs>
          </Column>
        </StretchedLayoutItem>
        <StretchedLayoutItem isFlex={1} isFlowing>
          {renderAsideContent()}
        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    </Column>
  );
};

AsideDesignColumn.contextTypes = {
  t: PropTypes.func,
};

export default AsideDesignColumn;
