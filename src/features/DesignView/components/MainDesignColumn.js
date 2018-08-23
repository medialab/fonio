import React, {Component} from 'react';
import StoryPlayer from 'quinoa-story-player';
import {render} from 'react-dom';

import {
  Column,
} from 'quinoa-design-library/components/';

import {processCustomCss} from '../../../helpers/postcss';

class PreviewWrapper extends Component {

  componentDidMount = () => {
    setTimeout(() => this.update(this.props));
  }
  componentWillReceiveProps = nextProps => {
    if (this.props.story !== nextProps.story || this.props.lang !== nextProps.lang) {
      setTimeout(() => this.update(this.props));
    }
  }

  update = (props) => {
    const {story, lang} = props;
    const contentDocument = this.iframe && this.iframe.contentDocument;
    const contentWindow = this.iframe && this.iframe.contentWindow;
    if (contentDocument) {
      let mount = contentDocument.getElementById('mount');
      if (!mount) {
        mount = contentDocument.createElement('div');
        mount.id = 'mount';
        contentDocument.body.appendChild(mount);
      }
      render(
        <StoryPlayer
          locale={lang}
          story={{
            ...story,
            settings: {
              ...story.settings,
              css: processCustomCss(story.settings.css)
            }
          
          }} 
          usedDocument={contentDocument}
          usedWindow={contentWindow}
        />, mount);
    }
  }
  render = () => {
    const bindRef = iframe => {
      this.iframe = iframe;
    }
    
    return <iframe style={{width: '100%', height: '100%'}} ref={bindRef} />;
  }
}


const MainDesignColumn = ({
  story,
  lang
}) => {


  return (
    <Column isSize={'fullwidth'} style={{position: 'relative'}}>
      {<PreviewWrapper story={story} lang={lang} />}
      {/*<StoryPlayer
        locale={lang}
        story={{
          ...story,
          settings: {
            ...story.settings,
            css: processCustomCss(story.settings.css)
          }
        }} />*/}
    </Column>
  );
};


export default MainDesignColumn;
