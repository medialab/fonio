/**
 * This module exports a stateless component rendering the layout of the configuration dialog feature interface
 * @module fonio/features/ConfigurationDialog
 */
import React from 'react';
import PropTypes from 'prop-types';

import {Form, Text, TextArea} from 'react-form';
// import {range} from 'lodash';

import HelpPin from '../../../components/HelpPin/HelpPin';
import AuthorsManager from '../../../components/AuthorsManager/AuthorsManager';
import Toaster from '../../../components/Toaster/Toaster';
// import OptionSelect from '../../../components/OptionSelect/OptionSelect';

import {translateNameSpacer} from '../../../helpers/translateUtils';

import './ConfigurationDialog.scss';

// import config from '../../../../config';
// const {maxSectionLevel} = config;

/**
 * Renders the configuration dialog layout
 * @param {object} props - the props to render
 * @param {object} props.storyCandidate - the data of the story to configure
 * @param {object} props.actions - actions from the redux logic
 * @param {function} props.closeStoryCandidate - function to trigger for closing the story
 * @return {ReactElement} markup
 */

// const AuthorsManagerInput = FormField(AuthorsManager);
const ConfigurationDialogLayout = ({
  activeStoryId,
  storyCandidate,
  createStoryLogStatus,
  // router props
  history,
  actions: {
    applyStoryCandidateConfiguration,
    createStory
  },
  closeStoryCandidate,
}, context) => {
  // namespacing the translation keys with feature id
  const translate = translateNameSpacer(context.t, 'Features.ConfigurationDialog');
  let toasterMessage;
  switch (createStoryLogStatus) {
    case 'processing':
      toasterMessage = translate('create-story-pending-log');
      break;
    case 'success':
      toasterMessage = translate('create-story-success-log');
      break;
    case 'failure':
      toasterMessage = translate('create-story-fail-log');
      break;
    default:
      break;
  }
  // const levelValues = range(maxSectionLevel).map(d => {
  //   return {
  //     value: d.toString(),
  //     label: (d + 1).toString()
  //   };
  // });

  /**
   * Callbacks
   */
  const errorValidator = (values) => {
    return {
      title: !values.title ? translate('story-title-is-required') : null,
      password: (!activeStoryId && (!values.password || values.password.length < 6)) ? translate('password-should-be-at-least-6-characters') : null,
      authors: values.authors.length < 1 || (values.authors.length === 1 && values.authors[0].trim().length === 0) ? translate('enter-an-author-name') : null
    };
  };

  const validatorFail = (errors, formApi) => {
    formApi.setTouched('authors', true);
  };
  const onApplyChange = (values) => {
    const newValues = {...values};
    delete newValues.password;

    // parse authors
    const authors = newValues.authors
                    .reduce((result, item) => result.concat(item.split(',')), [])
                    .map(d => d.trim())
                    .filter(d => d.length > 0);

    const newStoryCandidate = {
      ...storyCandidate,
      metadata: {
        ...storyCandidate.metadata,
        ...newValues,
        authors
      }
    };
    if (activeStoryId) {
      applyStoryCandidateConfiguration(newStoryCandidate);
    }
    else {
      createStory(newStoryCandidate, values.password)
     .then((res) => {
        if (res.result && res.result.data) {
          const {story} = res.result.data;
          applyStoryCandidateConfiguration(story);
          history.push({
            pathname: `/story/${story.id}/edit`
          });
        }
      });
    }
  };

  return (
    <div className="fonio-ConfigurationDialogLayout">
      <h1 className="modal-header">
        <span className="modal-header-title">{translate('story-configuration')}</span>
        <button className="close-btn" onClick={closeStoryCandidate}>
          <img src={require('../../../sharedAssets/cancel-white.svg')} />
        </button>
      </h1>
      <Form
        defaultValues={storyCandidate.metadata}
        validateError={errorValidator}
        onSubmitFailure={validatorFail}
        onSubmit={onApplyChange}>
        {formApi => (
          <form onSubmit={formApi.submitForm} className="fonio-form">
            <section className="modal-content">
              <section className="modal-row">
                <div className="modal-columns-container">
                  <div className="modal-column">
                    <div className="input-group">
                      <label htmlFor="title" className="label">
                        {translate('title-of-the-story')}*
                        <HelpPin>
                          {translate('what-is-the-title-of-your-story')}
                        </HelpPin>
                      </label>
                      <Text
                        field="title" id="title" type="text"
                        placeholder={translate('title-of-the-story')} />
                      {formApi.touched.title &&
                        <Toaster status={formApi.errors.title && 'failure'} log={formApi.errors.title} />
                      }
                    </div>
                    {!activeStoryId &&
                      <div className="input-group">
                        <label htmlFor="password" className="label">
                          {translate('password')}*
                          <HelpPin>
                            <p>{translate('password-help')}</p>
                            <p>{translate('password-should-be-at-least-6-characters')}</p>
                          </HelpPin>
                        </label>
                        <Text
                          field="password"
                          id="password"
                          type="password"
                          placeholder="password" />
                        {formApi.touched.password &&
                          <Toaster status={formApi.errors.password && 'failure'} log={formApi.errors.password} />
                        }
                      </div>
                    }
                    <div className="input-group">
                      <label htmlFor="authors">
                        {translate('authors-of-the-story')}*
                      </label>
                      <AuthorsManager
                        field="authors"
                        id="authors"
                        onChange={(authors) => formApi.setValue('authors', authors)}
                        authors={formApi.getValue('authors')} />
                      {formApi.touched.authors &&
                        <Toaster status={formApi.errors.authors && 'failure'} log={formApi.errors.authors} />
                      }
                    </div>
                    <div className="input-group" style={{flex: 1}}>
                      <label htmlFor="description">
                        {translate('description-of-the-story')}
                        <HelpPin>
                          {translate('description-help')}
                        </HelpPin>
                      </label>
                      <TextArea
                        field="description"
                        id="description"
                        type="text"
                        placeholder={translate('description-of-the-story')}
                        style={{flex: 1}} />
                    </div>
                    {/*<div className="input-group">
                      <label htmlFor="sectionLevel">{translate('level-of-sections')}</label>
                      <OptionSelect
                        activeOptionId={formApi.getValue('sectionLevel')}
                        options={levelValues}
                        onChange={(level) => formApi.setValue('sectionLevel', level)}
                        title={translate('choose-the-maximum-section-level-of-your-story')} />
                    </div>*/}
                  </div>
                  <Toaster status={createStoryLogStatus} log={toasterMessage} />
                </div>
              </section>
            </section>
            <section className="modal-footer">
              {
                storyCandidate
              ?
                <button
                  type="submit"
                  className="valid-btn">{activeStoryId /* todo : change to test if story is began */ ? translate('apply-changes-and-continue-story-edition') : translate('start-to-edit-this-story')}
                </button>
              : ''
            }
            </section>
          </form>
        )}
      </Form>
    </div>
  );
};


/**
 * Context data used by the component
 */
ConfigurationDialogLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

export default ConfigurationDialogLayout;
