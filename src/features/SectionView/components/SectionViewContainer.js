import React, {Component} from 'react';
// import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {
  withRouter,
} from 'react-router';


import * as duck from '../duck';

import * as connectionsDuck from '../../ConnectionsManager/duck';
import * as storyDuck from '../../StoryManager/duck';
import * as sectionsManagementDuck from '../../SectionsManager/duck';

import SectionViewLayout from './SectionViewLayout';

import EditionUiWrapper from '../../EditionUiWrapper/components/EditionUiWrapperContainer';

@connect(
  state => ({
    ...duck.selector(state.section),
    ...connectionsDuck.selector(state.connections),
    ...storyDuck.selector(state.editedStory),
    ...sectionsManagementDuck.selector(state.sectionsManagement),
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...connectionsDuck,
      ...storyDuck,
      ...sectionsManagementDuck,
      ...duck,
    }, dispatch)
  })
)

class SectionViewContainer extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    // require lock if edited story is here
    if (this.props.editedStory) {
      this.requireLockOnSection(this.props);
    }
  }

  componentWillReceiveProps = nextProps => {
    /**
     * if section id or story id is changed leave previous section and try to lock on next section
     */
    const {
      match: {
        params: {
          sectionId: prevSectionId,
          storyId: prevStoryId
        }
      }
    } = this.props;
    const {
      match: {
        params: {
          sectionId: nextSectionId,
          storyId: nextStoryId
        }
      },
    } = nextProps;

    /**
     * @todo skip this conditional with another strategy relying on components architecture
     */
    if (!this.props.editedStory && nextProps.editedStory) {
      this.requireLockOnSection(this.props);
    }

    if (prevSectionId !== nextSectionId || prevStoryId !== nextStoryId) {
      this.unlockOnSection(this.props);
      this.requireLockOnSection(nextProps);
    }
    /**
     * If section lock is failed/refused,
     * this means another client is editing the section
     * -> for now the UI behaviour is to get back client to the summary view
     */
     if (nextProps.viewLockState === 'fail') {
      nextProps.actions.setViewLockState(undefined);
      nextProps.history.push(`/story/${nextStoryId}/`);
     }
  }

  componentWillUnmount = () => {
    this.unlockOnSection(this.props);
  }

  unlockOnSection = props => {
    const {
      match: {
        params: {
          sectionId,
          storyId
        }
      },
      userId
    } = props;
    this.props.actions.leaveBlock({
      blockId: sectionId,
      storyId,
      userId,
      location: 'sections',
    });
  }

  requireLockOnSection = props => {
    const {
      match: {
        params: {
          sectionId,
          storyId
        }
      },
      userId
    } = props;
    this.props.actions.enterBlock({
      blockId: sectionId,
      storyId,
      userId,
      location: 'sections',
    });
  }

  goToSection = sectionId => {
    const {
      editedStory: {
        id
      }
    } = this.props;
    this.props.history.push(`/story/${id}/section/${sectionId}`);
  }


  render() {
    const {
      props: {
        editedStory,
        match: {
          params: {
            sectionId,
          }
        },
      }
    } = this;
    if (editedStory) {
      const section = editedStory.sections[sectionId];
      if (section) {
        return (
          <EditionUiWrapper>
            <SectionViewLayout
              section={section}
              story={this.props.editedStory}
              {...this.props} />
          </EditionUiWrapper>
        );
      }
      else return <div>Section does not exist</div>;
    }
    return null;
  }
}

export default withRouter(SectionViewContainer);
