import React from 'react';
import PropTypes from 'prop-types';

import {templates} from 'quinoa-story-player';

import {
  Button,
  // Box,
  // Checkbox,
  ColorPicker,
  CodeEditor,
  Column,
  // Content,
  Collapsable,
  Control,
  Dropdown,
  Field,
  Input,
  // Help,
  Label,
  Level,
  Select,
  Tab,
  TabLink,
  TabList,
  Tabs,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  // Title,
} from 'quinoa-design-library/components/';

import {translateNameSpacer} from '../../../helpers/translateUtils';

const AsideDesignColumn = ({
  asideTabCollapsed,
  asideTabMode,
  stylesMode = 'code',
  story = {},

  setAsideTabCollapsed,
  setAsideTabMode,

  onUpdateCss,
  onUpdateSettings,

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

  const renderAsideContent = () => {
    switch (asideTabMode) {
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
                        <option >{translate('side notes')}</option>
                        <option>{translate('foot notes')}</option>
                      </Select>
                    </Control>
                  </Field>
                </form>
              </Level>
            }
            {
              templateOptions.indexOf('allowDisqusComments') > -1 &&
              <Level>
                <form>
                  <Field>
                    <Label>{translate('Enable comments through disqus service')}</Label>
                    <Control>
                      <Select onChange={e => onOptionChange('allowDisqusComments', e.target.value)} value={options.allowDisqusComments}>
                        <option value="yes">{translate('enable')}</option>
                        <option value="no">{translate('disable')}</option>
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
            <Collapsable maxHeight={900} paddingBottom={'5rem'} isCollapsed={stylesMode === 'code'}>
              <form>
                <Field>
                  <Label>Text size:</Label>
                  <Dropdown
                    onToggle={() => console.log('set active size')/* eslint no-console :  0 */}
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
                      onEdit={() => console.log('edit background color')/* eslint no-console :  0 */} />
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
            </Collapsable>
            {stylesMode !== 'code' && <Level />}
            <Button
              isFullWidth
              isColor={stylesMode === 'gui' ? '' : 'primary'}
              onClick={() => console.log('set styles mode to', {stylesMode: stylesMode === 'gui' ? 'code' : 'gui'}) /* eslint no-console :  0 */}>
              {translate('Edit css (advanced)')}
            </Button>
            {stylesMode === 'code' && <Level />}
            <Collapsable isCollapsed={stylesMode !== 'code'}>
              <CodeEditor
                value={story.settings.css}
                onChange={onUpdateCss} />
            </Collapsable>
          </Column>
        );
    }
  };

  return (
    <Column className="is-hidden-mobile" isSize={asideTabCollapsed ? 1 : '1/4'} isWrapper>
      <StretchedLayoutContainer isDirection="vertical" isAbsolute>
        <StretchedLayoutItem>
          <Column>
            <Tabs isBoxed isFullWidth style={{overflow: 'hidden'}}>
              <TabList>
                {
                  !asideTabCollapsed &&
                  <Tab onClick={() => setAsideTabMode('settings')} isActive={asideTabMode === 'settings'}>
                    <TabLink>{translate('Settings')}</TabLink>
                  </Tab>
                }
                {
                  !asideTabCollapsed &&
                  'collapse' &&
                  <Tab onClick={() => setAsideTabMode('styles')} isActive={asideTabMode === 'styles'}>
                    <TabLink>
                      {translate('Styles')}
                    </TabLink>
                  </Tab>
                }
                <Tab className="is-hidden-mobile" onClick={() => setAsideTabCollapsed(!asideTabCollapsed)} isActive={asideTabCollapsed}><TabLink>{asideTabCollapsed ? '▶' : '◀'}</TabLink></Tab>
              </TabList>
            </Tabs>
          </Column>
        </StretchedLayoutItem>
        <StretchedLayoutItem isFlex={1} isFlowing>
          {!asideTabCollapsed && renderAsideContent()}
        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    </Column>
  );
};

AsideDesignColumn.contextTypes = {
  t: PropTypes.func,
};

export default AsideDesignColumn;
