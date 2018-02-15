/**
 * This module exports a stateful component connected to the redux logic of the app,
 * dedicated to rendering the sections manager feature interface
 * @module fonio/features/SectionsManager
 */
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {v4 as uuid} from 'uuid';
// import { DraggableDecorator } from 'draft-js-dnd-plugin';

import * as duck from '../duck';
import * as managerDuck from '../../StoriesManager/duck';
import {unpromptResourceEmbed} from '../../StoryEditor/duck';

import {
  createDefaultSection
} from '../../../helpers/schemaUtils';

import SectionsManagerLayout from './SectionsManagerLayout';


/**
 * Redux-decorated component class rendering the sections manager feature to the app
 */
@connect(
  state => ({
    ...duck.selector(state.sectionsManager),
    ...managerDuck.selector(state.stories),
    lang: state.i18nState.lang
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...duck,
      unpromptResourceEmbed
    }, dispatch)
  })
)
class SectionsManagerContainer extends Component {

  /**
   * constructor
   * @param {object} props - properties given to instance at instanciation
   */
  constructor(props) {
    super(props);
    this.createSection = this.createSection.bind(this);
    this.createSubSection = this.createSubSection.bind(this);
    this.updateSection = this.updateSection.bind(this);
    this.updateSectionsOrder = this.updateSectionsOrder.bind(this);
  }


  /**
   * Defines whether the component should re-render
   * @param {object} nextProps - the props to come
   * @param {object} nextState - the state to come
   * @return {boolean} shouldUpdate - whether to update or not
   */
  shouldComponentUpdate() {
    // todo: optimize when the feature is stabilized
    return true;
  }


  /**
   * Creates a new section by attributing default shape
   * and unique id.
   * Additionnaly it tries to be smart in name giving
   */
  createSection() {
    const id = uuid();
    const defaultSection = createDefaultSection();
    // look for a "chapter 1, chapter 2, ..."
    // or "section 1, section 2, ..." pattern in the title of the
    // last section to infer automatically a proper section name (e.g. "chapter 3")
    // todo: this is a bit of a gadget and I don't know if it should be kept, but it was fun !
    const chapRegex = /(chap[^\d]+|sec[^\d]+|part[^\d]+)(\d)/gi;
    const lastSection = this.props.activeStory.sections[this.props.activeStory.sectionsOrder[this.props.activeStory.sectionsOrder.length - 1]];
    const lastTitle = lastSection && lastSection.metadata && lastSection.metadata.title;
    if (lastTitle) {
      if (lastTitle.match(chapRegex)) {
        const parts = chapRegex.exec(lastTitle);
        if (parts) {
          const exp = parts[1];
          const num = +parts[2];
          defaultSection.metadata.title = exp + (num + 1);
        }
      }
    }

    // formatting the action to create the section
    const {
      activeStoryId
    } = this.props;
    defaultSection.id = id;
    this.props.actions.createSection(activeStoryId, id, defaultSection, true);
  }


  /**
   * Create a new section one level bellow the current one (e.g. "part 1" --> "part 1.1").
   * Reminder: I chose to handle sections hierarchy (part 1, part 1.1, ...)
   * in a soft way by keeping a "flat" structure.
   * We could have organized the sections' summary in a tree structure
   * but rather they are organized as a flat array
   * but have for each a "level" metadata prop that represents
   * their degree of hierarchy in the summary of the story.
   * That way things keep lightweight and easy to manipulate
   * for us and for the user.
   * @param {object} section - the "mother" section to infer a subsection from
   * @param {string} index - the index of the mother section
   */
  createSubSection(section, index) {
    const {
      activeStoryId,
      selectedSectionLevel
    } = this.props;

    let newLevel = section.metadata.level + 1;
    newLevel = newLevel > selectedSectionLevel ? selectedSectionLevel : newLevel;
    // create section
    const id = uuid();
    const defaultSection = createDefaultSection();
    defaultSection.id = id;
    defaultSection.metadata.level = newLevel;

    this.props.actions.createSection(activeStoryId, id, defaultSection, true);

     // change order
    setTimeout(() => {
      let order = this.props.activeStory.sectionsOrder;
      const newId = order[order.length - 1];
      order =
      [
        ...order.slice(0, index + 1),
        newId,
        ...order.slice(index + 1, order.length - 1)
      ];
      this.updateSectionsOrder(order);
    });
  }


  /**
   * Updates a section
   * @param {string} id - id of the section
   * @param {object} section - the new section to merge with the old one
   */
  updateSection(id, section) {
    const {
      activeStoryId
    } = this.props;
    this.props.actions.updateSection(activeStoryId, id, section);
  }


  /**
   * Updates the story's summary order
   * @param {array<string>} order - new array of sections' ids
   */
  updateSectionsOrder(order) {
    const {
      activeStoryId
    } = this.props;
    this.props.actions.updateSectionsOrder(activeStoryId, order);
  }


  /**
   * Renders the component
   * @return {ReactElement} component - the component
   */
  render() {
    const {
      sectionsSearchQuery,
      activeStory,
      selectedSections
    } = this.props;
    let sections = activeStory.sections;
    const sectionsOrder = activeStory.sectionsOrder;
    if (sections) {
      const selectedSectionsIds = selectedSections;
      sections = sectionsOrder
      .filter(sectionKey => {
        if (selectedSectionsIds && selectedSectionsIds.length) {
         return selectedSectionsIds.indexOf(sectionKey) > -1;
        }
        else return true;
      })
      .map(id => ({...this.props.activeStory.sections[id], id}))
      .filter(section => {
        if (sectionsSearchQuery && sectionsSearchQuery.length) {
          return JSON.stringify(section.metadata).toLowerCase().indexOf(sectionsSearchQuery.toLowerCase()) > -1;
        }
        else return true;
      });
    }
    return (
      <SectionsManagerLayout
        {...this.props}
        sections={sections}
        createSection={this.createSection}
        createSubSection={this.createSubSection}
        updateSection={this.updateSection}
        updateSectionsOrder={this.updateSectionsOrder} />
    );
  }
}

export default SectionsManagerContainer;
