import React from 'react';
import PropTypes from 'prop-types';
import { translateNameSpacer } from '../../helpers/translateUtils';

import {
    ModalCard,
    Button,
    Content,
  } from 'quinoa-design-library/components/';
const EmbedHelpModal = ( {
    isOpen,
    onRequestClose,
    onChooseSample
}, context ) => {
    const translate = translateNameSpacer( context.t, 'Components.EmbedHelpModal' );

    const tools = [
    {
        toolName: 'Tesselle',
        toolURL: 'https://medialab.github.io/tesselle',
        embedCode: '<iframe allowfullscreen="true" src="https://medialab.github.io/tesselle-example/"></iframe>',
        whatFor: translate( 'Annotate an image' )
    },
    {
        toolName: 'Timeline JS',
        toolURL: 'https://timeline.knightlab.com',
        embedCode: '<iframe allowfullscreen="true" src="https://timeline.knightlab.com/examples/republican/index.html"></iframe>',
        whatFor: translate( 'Make a timeline' )
    },
    {
        toolName: 'Soundcloud',
        toolURL: 'https://soundcloud.com',
        embedCode: '<iframe scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/573509655&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>',
        whatFor: translate( 'Share an audio interview' )
    },
    {
        toolName: 'Graphcommons',
        toolURL: 'https://graphcommons.com/',
        embedCode: '<iframe allowfullscreen="true" src="https://graphcommons.com/graphs/f613de7b-4d02-49eb-aa43-1d9ee5168182/embed?fitgraph=true" frameborder="0" style="overflow:hidden;width:1px;min-width:100%;height: 100vh;min-height:400px;" width="100%" height="100%" allowfullscreen></iframe>',
        whatFor: translate( 'Build a network of people, organization, issues' )
    },
    {
        toolName: 'Dicto',
        toolURL: 'https://dictoapp.github.io',
        embedCode: '<iframe allowfullscreen="true" src="https://dictoapp.github.io/corpus-example/"></iframe>',
        whatFor: translate( 'Tag and annotate online videos' )
    }
    ];
    return (
      <ModalCard
        isActive={ isOpen }
        onClose={ onRequestClose }
        headerContent={ translate( 'Advanced block help' ) }
        style={ {
            maxHeight: '80%',
            minWidth: '80%'
        } }
        mainContent={
          <div>
            <Content>
              <p>{translate( 'Advanced blocks allow you to feature (HTML) contents coming from the various online tools and platform that can help you mobilize the documents and data of your inquiry in your website.' )}</p>
              <p>
                {translate( 'Here are some examples of tools and code blocks you could include:' )}
              </p>
            </Content>
            <table
              style={ { maxWidth: '100%' } }
              className={ 'table' }
            >
              <thead>
                <tr>
                  <th>{translate( 'What for' )}</th>
                  <th>{translate( 'What tool' )}</th>
                  <th>{translate( 'Example code to paste' )}</th>
                </tr>
              </thead>
              <tbody>
                {
                            tools.map( ( tool, index ) => {
                                const handleClick = ( e ) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onChooseSample( tool.embedCode );
                                };
                                return (
                                  <tr key={ index }>
                                    <th>{tool.whatFor}</th>
                                    <th>
                                      <a
                                        href={ tool.toolURL }
                                        target={ 'blank' }
                                        rel={ 'noopener' }
                                      >
                                        {tool.toolName}
                                      </a>
                                    </th>
                                    <th>
                                      <code style={ { wordBreak: 'break-word' } }>{tool.embedCode}</code>
                                      <br />
                                      <Button onClick={ handleClick }>
                                        {translate( 'test it' )}
                                      </Button>
                                    </th>
                                  </tr>
                                );
                            } )
                        }
              </tbody>
            </table>

          </div>
            }
      />
    );
};

EmbedHelpModal.contextTypes = {
    t: PropTypes.func,
};

export default EmbedHelpModal;
