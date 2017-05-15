/* eslint react/no-danger : 0 */
/**
 * This module provides a asset preview element component
 * @module fonio/components/AssetPreview
 */
import React, {Component} from 'react';
import {Media, Player} from 'react-media-player';
import QuinoaPresentationPlayer from 'quinoa-presentation-player';
import BibliographicPreview from '../BibliographicPreview/BibliographicPreview';

import './AssetPreview.scss';

class EmbedContainer extends Component {

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.html !== nextProps.html;
  }

  render() {
    const {
      html
    } = this.props;
    return (<div
      dangerouslySetInnerHTML={{
            __html: html
          }} />);
  }
}

const AssetPreview = ({
  type,
  data
}) => {
  switch (type) {
    case 'image':
      return <img src={data.base64} />;
    case 'video':
      return (
        <Media>
          <Player src={data.url} />
        </Media>
      );
    case 'data-presentation':
      return (
        <QuinoaPresentationPlayer
          presentation={data} />
      );
    case 'embed':
      return (
        <EmbedContainer html={data} />
      );
    case 'bib':
      const items = data.reduce((result, item) => ({
        ...result,
        [item.id]: item
      }), {});
      return (
        <BibliographicPreview
          items={items} />
      );
    default:
      return null;
  }
};

export default AssetPreview;
