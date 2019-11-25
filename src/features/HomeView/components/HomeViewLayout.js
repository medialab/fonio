/**
 * This module provides a connected component for displaying the home view
 * @module fonio/features/HomeView
 */
/* eslint react/jsx-no-bind:0 */
/* eslint react/prefer-stateless-function : 0 */
/* eslint react/no-danger : 0 */
/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FlipMove from 'react-flip-move';
import { v4 as genId } from 'uuid';
import ReactTooltip from 'react-tooltip';
import {
  Button,
  Column,
  Columns,
  Container,
  Content,
  Control,
  Field,
  Help,
  Hero,
  Notification,

  /*
   * HeroBody,
   * HeroFooter,
   */
  HeroHeader,
  Input,
  Level,
  ModalCard,
  Navbar,
  StretchedLayoutContainer,
  StretchedLayoutItem,

  /*
   * Tab,
   * TabLink,
   * TabList,
   * Tabs,
   */
  Title,
} from 'quinoa-design-library/components/';
import icons from 'quinoa-design-library/src/themes/millet/icons';

/**
 * Imports Project utils
 */
import { createDefaultSection } from '../../../helpers/schemaUtils';
import { saveStoryToken, deleteStoryToken } from '../../../helpers/localStorageUtils';
import { translateNameSpacer } from '../../../helpers/translateUtils';

/**
 * Imports Components
 */
import ChangePasswordModal from './ChangePasswordModal';
import DeleteStoryModal from './DeleteStoryModal';
import EnterPasswordModal from './EnterPasswordModal';
import Footer from './Footer';
import IdentificationModal from '../../../components/IdentificationModal';
import LanguageToggler from '../../../components/LanguageToggler';
import NewStoryForm from './NewStoryForm';
import OtherUsersWidget from './OtherUsersWidget';
import ProfileWidget from './ProfileWidget';
import StoryCardWrapper from './StoryCardWrapper';

/**
 * Imports Assets
 */
import config from '../../../config';
import pdfFr from 'file-loader!../assets/user-guide-fr.pdf';
import pdfEn from 'file-loader!../assets/user-guide-fr.pdf';

/**
 * Shared variables
 */
const { maxStorySize, demoMode } = config;
const DEFAULT_BACKGROUND_COLOR = 'lightblue';

class HomeViewLayout extends Component {
  constructor( props, context ) {
    super( props );

    this.translate = translateNameSpacer( context.t, 'Features.HomeView' );
  }

  componentWillUpdate = ( _nextProps, _nextState, nextContext ) => {
    if ( this.context.t !== nextContext.t ) {
       this.translate = translateNameSpacer( nextContext.t, 'Features.HomeView' );
    }
  }

  renderLearnTab = ( _mode, lang = 'en' ) => {
    return (
      <Container>
        <Column>
          <Content>
            <h1>{this.translate( 'Learn fonio' )}</h1>
            <iframe
              style={ { width: '100%', minHeight: '80vh' } }
              src={ lang === 'en' ? pdfEn : pdfFr }
            />
          </Content>
        </Column>
      </Container>
    );
  }

  renderAboutTab = () => {
    const handleCloseAbout = () => {
      this.props.actions.setTabMode( 'stories' );
    };
    return (
      <Container>
        <Columns style={ { paddingTop: '1rem' } }>
          <Column
            style={ { marginLeft: '1rem', paddingRight: 0 } }
            isSize={ '1/3' }
            className={ 'about-aside' }
          >
            <Title isSize={ 3 }>{this.translate( 'About fonio' )}</Title>
            <Button onClick={ handleCloseAbout }>{'◀ '}{this.translate( 'back to the classroom' )}</Button>
          </Column>
          <Column
            isSize={ '2/3' }
            style={ { paddingLeft: 0 } }
            className={ 'about-content' }
          >
            <Content style={ { paddingTop: '.5rem' } }>
              <p>
                {this.translate( 'about fonio details' )}
              </p>
              <p>
                {this.translate( 'about fonio documentation' )}
              </p>
              <p>
                {this.translate( 'about fonio design' )}
              </p>
              <p>
                {this.translate( 'about fonio collaboration' )}
              </p>
              <p>
                {this.translate( 'about fonio workflow' )}
              </p>
            </Content>
            <Content>
              <p
                dangerouslySetInnerHTML={ {
                        __html: this.translate( 'Provided by the <a target="blank" href="http://controverses.org/">FORCCAST</a> program, fostering pedagogical innovations in controversy mapping.' )
                      } }
              />
              <p
                dangerouslySetInnerHTML={ {
                        __html: this.translate( 'Made at the <a target="blank" href="http://medialab.sciencespo.fr/">médialab SciencesPo</a>, a research laboratory that connects social sciences with inventive methods.' )
                      } }
              />
              <p>{this.translate( 'Avatar icons courtesy of ' )}
                <a
                  target={ 'blank' }
                  href={ 'https://www.flaticon.com/packs/people-faces' }
                >
                      Freepik
                </a>.
              </p>

            </Content>
            <Title>
              {this.translate( 'Contributing and signaling bugs' )}
            </Title>
            <Content>
              <p>
                <span
                  dangerouslySetInnerHTML={ {
                        __html: this.translate( 'The source code of Fonio is licensed under free software license ' )
                  } }
                />
                <a
                  target={ 'blank' }
                  href={ 'http://www.gnu.org/licenses/agpl-3.0.html' }
                >AGPL v3
                </a>
                {this.translate( ' and is hosted on ' )}
                <a
                  target={ 'blank' }
                  href={ 'https://github.com/medialab/fonio/' }
                >Github
                </a>.
              </p>

              <p
                dangerouslySetInnerHTML={ {
                      __html: this.translate( 'For suggesting improvements or signaling bugs, please head to <a href="https://docs.google.com/forms/d/e/1FAIpQLSfbo6ShhqQeSdZxnuBvqyskVGiC3NKbdyPpIFL1SIA04wkmZA/viewform?usp=sf_link">this page</a> and fill the questionnaire. Thanks !' )
                    } }
              />
            </Content>
          </Column>

        </Columns>

      </Container>
        );
  }

  renderStoriesTab = ( __mode, lang ) => {

    /**
     * Variables definition
     */
    const {
      stories,
      newStory,
      newStoryOpen,
      newStoryTabMode,
      userInfo,
      sortingMode,
      searchString,
      editionHistory,

      lockingMap,
      activeUsers,
      userId,
      storyDeleteId,
      changePasswordId,
      passwordModalOpen,
      createStoryStatus,
      overrideStoryStatus,
      deleteStoryStatus,
      importStoryStatus,
      overrideImport,
      overrideStoryMode,

      loginStatus,
      changePasswordStatus,

      history,
      actions: {
        createStory,
        overrideStory,
        duplicateStory,
        deleteStory,
        loginStory,
        importStory,
        changePassword,
        setNewStoryTabMode,
        setIdentificationModalSwitch,
        setNewStoryOpen,
        setSortingMode,
        setSearchString,
        setStoryDeleteId,
        setChangePasswordId,
        setPasswordModalOpen,
        setOverrideImport,
        setOverrideStoryMode,
        setErrorMessage,
      }
    } = this.props;

    /**
     * Computed variables
     */
    const storiesList = Object.keys( stories ).map( ( id ) => ( { id, ...stories[id] } ) );
    const searchStringLower = searchString.toLowerCase();
    const visibleStoriesList = storiesList.filter( ( s ) => {
      const data = JSON.stringify( s ).toLowerCase();
      return data.includes( searchStringLower );
    } )
    .sort( ( a, b ) => {
      switch ( sortingMode ) {
        case 'edited recently':
          if ( a.lastUpdateAt > b.lastUpdateAt ) {
            return -1;
          }
          return 1;
        case 'edited by me':
          if ( !editionHistory[b.id] || editionHistory[a.id] > editionHistory[b.id] ) {
            return -1;
          }
          return 1;
        case 'title':
        default:
          if ( a.metadata.title.toLowerCase().trim() > b.metadata.title.toLowerCase().trim() ) {
            return 1;
          }
          return -1;
      }
    } );

    /**
     * Callbacks handlers
     */
    const handleConfirmImport = ( importMode ) => {
      setOverrideImport( false );
      setOverrideStoryMode( importMode );
      setPasswordModalOpen( true );
    };
    const handleDeleteStory = ( password ) => {
      loginStory( { storyId: storyDeleteId, password } )
      .then( ( res ) => {
        if ( res.result && res.result.data ) {
          const { token } = res.result.data;
          deleteStory( { storyId: storyDeleteId, token } )
          .then( ( resp ) => {
            if ( resp.result ) deleteStoryToken( storyDeleteId );
          } );
        }
      } );
    };
    const handleChangePassword = ( oldPassword, newPassword ) => {
      changePassword( { storyId: changePasswordId, oldPassword, newPassword } )
      .then( ( res ) => {
        if ( res.result && res.result.data ) {
          const { token } = res.result.data;
          saveStoryToken( changePasswordId, token );
        }
      } );
    };
    const handleDropFiles = ( files ) => {
      if ( !files || !files.length ) {
        return;
      }
      else if ( files[0].size > maxStorySize ) {
        setErrorMessage( { type: 'IMPORT_STORY_FAIL', error: 'file is too large' } );
        return;
      }
      importStory( files[0] )
      .then( ( res ) => {
        const storyImported = res.result;
        if ( storyImported ) {
         // override an existing story (which has the same id)
          const existant = storiesList.find( ( story ) => story.id === storyImported.id );
          // has preexisting story, prompt for override
          if ( existant !== undefined ) {
            setOverrideImport( true );
          }
          else {
            setOverrideImport( false );
            setOverrideStoryMode( 'create' );
            setPasswordModalOpen( true );
          }
        }
      } );
    };
    const handleCreateNewStory = ( payload ) => {
      const startingSectionId = genId();
      const defaultSection = createDefaultSection();
      const startingSection = {
        ...defaultSection,
        id: startingSectionId,
        metadata: {
          ...defaultSection.metadata,
          title: 'Introduction'
        }
      };
      const story = {
        ...payload.payload,
        sections: {
          [startingSectionId]: startingSection,
        },
        sectionsOrder: [ startingSectionId ]
      };

      createStory( { ...payload, payload: story } )
      .then( ( res ) => {
        if ( res.result ) {
          const { story: thatStory, token } = res.result.data;
          saveStoryToken( thatStory.id, token );
          setNewStoryOpen( false );
          history.push( {
            pathname: `/story/${thatStory.id}/section/${startingSectionId}`,
          } );
        }
      } );
    };
    const handleCreateExistingStory = ( password ) => {
      createStory( {
        payload: newStory,
        password
      } )
      .then( ( res ) => {
        if ( res.result ) {
          setPasswordModalOpen( false );
          saveStoryToken( res.result.data.story.id, res.result.data.token );
          setNewStoryOpen( false );
          history.push( {
            pathname: `/story/${res.result.data.story.id}/`,
          } );
        }
      } );
    };
    const handleOverrideExistingStory = ( password ) => {
      loginStory( { storyId: newStory.id, password } )
      .then( ( res ) => {
        if ( res.result && res.result.data ) {
          const { token } = res.result.data;
          saveStoryToken( newStory.id, token );
          overrideStory( { payload: newStory, token } )
          .then( ( resp ) => {
            if ( resp.result ) {
              setPasswordModalOpen( false );
              setNewStoryOpen( false );
              history.push( {
                pathname: `/story/${newStory.id}/`,
              } );
            }
          } );
        }
      } );
    };
    const handleSearchStringChange = ( e ) => setSearchString( e.target.value );
    const handleOpenIdentificationModal = () => setIdentificationModalSwitch( true );
    const handleToggleNewStoryOpened = () => setNewStoryOpen( !newStoryOpen );
    const handleSortByEditedByMe = () => setSortingMode( 'edited by me' );
    const handleSortByEditedRecently = () => setSortingMode( 'edited recently' );
    const handleSortByTitle = () => setSortingMode( 'title' );
    const handleAbortPasswordChange = () => setChangePasswordId( undefined );
    const handleAbortStoryDeletion = () => setStoryDeleteId( undefined );
    const handleCloseNewStory = () => setNewStoryOpen( false );
    const handleSetNewStoryModeForm = () => setNewStoryTabMode( 'form' );
    const handleSetNewStoryModeFile = () => setNewStoryTabMode( 'file' );
    const handleCloseOverrideImport = () => setOverrideImport( false );
    const handleConfirmImportOverride = () => handleConfirmImport( 'override' );
    const handleConfirmImportCreate = () => handleConfirmImport( 'create' );
    const handleClosePasswordModal = () => setPasswordModalOpen( false );

    return (
      <Container>
        <Columns>
          <Column
            style={ { paddingLeft: '1.3rem', paddingTop: '1.4rem' } }
            isSize={ '1/3' }
          >
            <Column>
              <Title isSize={ 3 }>
                {config.sessionName /* eslint no-undef: 0 */}
              </Title>
              <div>
                <Button
                  isFullWidth
                  onClick={ handleToggleNewStoryOpened }
                  isColor={ newStoryOpen ? 'primary' : 'primary' }
                >
                  {this.translate( 'New story' )}
                </Button>
              </div>

              <Level />

              <ProfileWidget
                translate={ this.translate }
                onEdit={ handleOpenIdentificationModal }
                userInfo={ userInfo }
              />
              <Level />

              <OtherUsersWidget
                translate={ this.translate }
                users={ activeUsers }
                userId={ userId }
              />

              <Level />
              <Level />
            </Column>
          </Column>
          {
            ( storiesList.length > 0 || demoMode ) &&
              <Column
                isHidden={ newStoryOpen }
                isSize={ '2/3' }
              >
                <Column>
                  <StretchedLayoutContainer
                    isFluid
                    isDirection={ 'horizontal' }
                  >
                    <StretchedLayoutItem
                      isFluid
                      isFlex={ 1 }
                    >
                      <Field hasAddons>
                        <Control>
                          <Input
                            value={ searchString }
                            style={ { top: '.75rem' } }
                            onChange={ handleSearchStringChange }
                            placeholder={ this.translate( 'find a story' ) }
                          />
                        </Control>
                      </Field>
                    </StretchedLayoutItem>
                    <StretchedLayoutItem isFluid>
                      <Column style={ { paddingRight: 0 } }>
                        {
                          storiesList.length > 1 ?
                            <StretchedLayoutContainer
                              isDirection={ 'horizontal' }
                              isFluid
                              style={ { paddingTop: '.5rem' } }
                            >
                              <StretchedLayoutItem><i>{this.translate( 'sort {n} stories by', { n: storiesList.length } )}</i></StretchedLayoutItem>
                              <StretchedLayoutItem>
                                <span style={ { paddingLeft: '1rem', paddingRight: '.1rem' } } />
                                <a onClick={ handleSortByEditedByMe }>
                                  {
                                sortingMode === 'edited by me' ?
                                  <strong>{this.translate( 'edited by me' )}</strong>
                                  :
                                  this.translate( 'edited by me' )
                              }
                                </a>
                              </StretchedLayoutItem>
                              <StretchedLayoutItem>
                                <span style={ { paddingLeft: '1rem', paddingRight: '.1rem' } } />
                                <a onClick={ handleSortByEditedRecently }>
                                  {
                                sortingMode === 'edited recently' ?
                                  <strong>{this.translate( 'edited recently' )}</strong>
                                  :
                                  this.translate( 'edited recently' )
                              }
                                </a>
                              </StretchedLayoutItem>
                              <StretchedLayoutItem>
                                <span style={ { paddingLeft: '1rem', paddingRight: '.1rem' } } />
                                <a onClick={ handleSortByTitle }>
                                  {
                                sortingMode === 'title' ?
                                  <strong>{this.translate( 'title' )}</strong>
                                  :
                                  this.translate( 'title' )
                              }
                                </a>
                              </StretchedLayoutItem>
                            </StretchedLayoutContainer>
                        : null}
                      </Column>
                    </StretchedLayoutItem>
                  </StretchedLayoutContainer>
                </Column>
                <FlipMove>
                  {
                    demoMode &&
                    <Column style={ { paddingTop: '2rem' } }>
                      <Notification isColor={ 'primary' }>
                        <Title isSize={ 5 }>{this.translate( 'Welcome to the demo version of Fonio !' )}</Title>
                        <p>
                          {this.translate( 'about fonio details' )}
                        </p>
                        <p>
                          {this.translate( 'In this demo version, you can browse tutorials and example stories, and create your own to discover the tool numerous features.' )}
                        </p>

                      </Notification>
                      <Notification isColor={ 'warning' }>
                        <Title isSize={ 5 }>{this.translate( 'Demo version limitations: do not use for real projects' )}</Title>
                        <p>
                          <strong>
                            {this.translate( 'For technical and legal reasons, the stories you might create on this demo version of Fonio will not persist in time and will be erased as soon as you leave them.' )}
                          </strong>
                        </p>
                        <p>
                          {this.translate( 'In order to use Fonio for real use cases, please head to the project free and open source repository' )}
                          <a
                            target={ '_blank' }
                            rel={ 'noopener' }
                            href={ 'https://github.com/medialab/fonio/#installation' }
                          >
                            Fonio on github
                          </a>
                        </p>

                      </Notification>
                    </Column>
                  }

                  {
                        visibleStoriesList.map( ( story ) => {
                          const handleAction = ( id, event ) => {
                            event.stopPropagation();
                            switch ( id ) {
                              case 'open':
                                history.push( {
                                  pathname: `/story/${story.id}`
                                } );
                                break;
                              case 'read':
                                history.push( {
                                  pathname: `/read/${story.id}?lang=${lang}`
                                } );
                                break;
                              case 'duplicate':
                                duplicateStory( { storyId: story.id } )
                                .then( ( res ) => {
                                  if ( res.result ) {
                                    setPasswordModalOpen( true );
                                    setOverrideStoryMode( 'create' );
                                  }
                                } );
                                break;
                              case 'delete':
                                setStoryDeleteId( story.id );
                                break;
                              case 'change password':
                                setChangePasswordId( story.id );
                                break;
                              default:
                                break;
                            }
                          };
                          const users = lockingMap[story.id] ?
                            Object.keys( lockingMap[story.id].locks )
                              .map( ( thatUserId ) => {
                                return {
                                  ...activeUsers[thatUserId]
                                };
                              } )
                          : [];

                          const handleClick = ( e ) => {
                            e.stopPropagation();
                            history.push( `/story/${story.id}` );
                          };
                          return (
                            <StoryCardWrapper
                              key={ story.id }
                              story={ story }
                              users={ users }
                              onClick={ handleClick }
                              onAction={ handleAction }
                            />
                          );
                        } )
                      }
                </FlipMove>
                {storyDeleteId &&
                  <DeleteStoryModal
                    loginStatus={ loginStatus }
                    deleteStatus={ deleteStoryStatus }
                    onSubmitPassword={ handleDeleteStory }
                    onCancel={ handleAbortStoryDeletion }
                  />
                }
                {changePasswordId &&
                  <ChangePasswordModal
                    changePasswordStatus={ changePasswordStatus }
                    handleChangePassword={ handleChangePassword }
                    onCancel={ handleAbortPasswordChange }
                  />
                }
              </Column>
          }
          {
            newStoryOpen &&
              <NewStoryForm
                widthRatio={ newStoryOpen ? '2/3' : '1/2' }
                createStoryStatus={ createStoryStatus }
                importStoryStatus={ importStoryStatus }
                mode={ newStoryTabMode }
                newStory={ newStory }
                onClose={ handleCloseNewStory }
                onCloseNewStory={ handleCloseNewStory }
                onCreateNewStory={ handleCreateNewStory }
                onDropFiles={ handleDropFiles }
                onSetModeFile={ handleSetNewStoryModeFile }
                onSetModeForm={ handleSetNewStoryModeForm }
                translate={ this.translate }
              />
          }
          {passwordModalOpen && overrideStoryMode &&
            <EnterPasswordModal
              mode={ overrideStoryMode }
              status={ overrideStoryMode === 'create' ? createStoryStatus : overrideStoryStatus }
              loginStatus={ loginStatus }
              onSubmitPassword={ overrideStoryMode === 'create' ? handleCreateExistingStory : handleOverrideExistingStory }
              onCancel={ handleClosePasswordModal }
            />
          }
        </Columns>
        <ModalCard
          isActive={ overrideImport }
          headerContent={ this.translate( 'Override story' ) }
          onClose={ handleCloseOverrideImport }
          mainContent={
            <Help isColor={ 'danger' }>
              {this.translate( 'Story exists, do you want to override it?' )}
            </Help>
          }
          footerContent={ [
            <Button
              isFullWidth
              key={ 0 }
              onClick={ handleConfirmImportOverride }
              isDisabled={ lockingMap[newStory.id] && Object.keys( lockingMap[newStory.id].locks ).length > 0 }
              isColor={ 'danger' }
            >{this.translate( 'Override exist story' )}
            </Button>,
            <Button
              isFullWidth
              key={ 1 }
              onClick={ handleConfirmImportCreate }
              isColor={ 'warning' }
            >{this.translate( 'Create new story' )}
            </Button>,
            <Button
              isFullWidth
              key={ 2 }
              onClick={ handleCloseOverrideImport }
            >
              {this.translate( 'Cancel' )}
            </Button>
              ] }
        />
      </Container>
    );
  }

  renderVisibleTab = ( mode, lang = 'en' ) => {
    switch ( mode ) {
      case 'learn':
        return this.renderLearnTab( mode, lang );
      case 'about':
        return this.renderAboutTab( mode, lang );
      case 'stories':
      default:
        return this.renderStoriesTab( mode, lang );
    }
  }

  render = () => {

    /**
     * Variables definition
     */
    const {
      props: {
        tabMode,
        identificationModalSwitch,
        userInfoTemp,
        userId,
        navbarOpen,
        lang,
        actions: {
          setTabMode,
          setIdentificationModalSwitch,
          setUserInfoTemp,
          setUserInfo,
          createUser,
          toggleNavbarOpen,
        }
      },
      renderVisibleTab,
    } = this;

    /**
     * Callbacks handlers
     */
    const handleSubmitUserInfo = () => {
      createUser( {
        ...userInfoTemp,
        userId
      } );
      setUserInfo( userInfoTemp );
      setIdentificationModalSwitch( false );
    };

    /*
     * const handleSetTabModeStories = () => setTabMode( 'stories' );
     * const handleSetTabModeAbout = () => setTabMode( 'about' );
     */
    const handleSwitchAbout = () => {
      if ( tabMode === 'stories' ) {
        setTabMode( 'about' );
      }
 else setTabMode( 'stories' );
    };
    const handleCloseIdentificationModal = () => setIdentificationModalSwitch( false );

    return (
      <section>
        <Hero
          isColor={ 'success' }
          isSize={ 'large' }
          style={ {
                background: config.backgroundColor || DEFAULT_BACKGROUND_COLOR,
              } }
        >
          <HeroHeader>
            <Navbar
              isOpen={ navbarOpen === true }
              onToggle={ toggleNavbarOpen }
              isFixed
              brandImage={ icons.fonioBrand.svg }

              locationBreadCrumbs={ [
              // {
              //   href: '/',
              //   content:  <strong>{config.sessionName /* eslint no-undef: 0 */}</strong>,
              //   isActive: true
              // },
            ] }

              actionOptions={ [
            {
              content: (
                <Button
                  onClick={ handleSwitchAbout }
                  isColor={ tabMode === 'about' ? 'primary' : undefined }
                >
                  {this.translate( 'About' )}
                </Button>
              )
            },
            {
              content: <LanguageToggler />
            }
            ] }
            />
          </HeroHeader>

          {/*screen-wide intro screen with session title */}
          {/*<HeroBody style={ { paddingBottom: '10rem', paddingTop: '10rem' } }>
            <Container hasTextAlign={ 'centered' }>
              <Title>{config.sessionName}</Title>
            </Container>
          </HeroBody>*/}
          <Level />

          {/*main contents with tabs */}
          {/* <HeroFooter>
            <Tabs
              isBoxed
              isFullWidth
            >
              <Container>
                <TabList>
                  <Tab
                    onClick={ handleSetTabModeStories }
                    isActive={ tabMode === 'stories' }
                  ><TabLink>{this.translate( 'Stories' )}</TabLink>
                  </Tab>
                  <Tab
                    onClick={ handleSetTabModeAbout }
                    isActive={ tabMode === 'about' }
                  ><TabLink>{this.translate( 'About' )}</TabLink>
                  </Tab>
                </TabList>
              </Container>
            </Tabs>
          </HeroFooter> */}
        </Hero>

        {/* main contents */}
        <Container>
          <Level style={ { height: '3rem' } } />
          {renderVisibleTab( tabMode, lang )}
          <Level />
          <Level />
        </Container>

        <Footer
          id={ 'footer' }
          translate={ this.translate }
        />

        <IdentificationModal
          isActive={ identificationModalSwitch }

          userInfo={ userInfoTemp }

          onChange={ setUserInfoTemp }
          onClose={ handleCloseIdentificationModal }
          onSubmit={ handleSubmitUserInfo }
        />

        <ReactTooltip id={ 'tooltip' } />

      </section>
    );
  }
}

/**
 * Context data used by the component
 */
HomeViewLayout.contextTypes = {

  /**
   * Un-namespaced translate function
   */
  t: PropTypes.func.isRequired
};

export default HomeViewLayout;
