/**
 * This module provides a componnt for displaying an author status in edited story
 * @module fonio/features/SummaryView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import {
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Image,
  Help
} from 'quinoa-design-library/components';

/**
 * Imports Project utils
 */
import { abbrevString } from '../../../helpers/misc';

const AuthorItem = ( {
  author,
  translate,
  sections,
  onClick,
  userId,
  clickable
} ) => {

  /**
   * Computed variables
   */
  const { name: initialName, locks = {} } = author;
  let name;
  if ( author.userId === userId ) {
    name = translate( '{a} (you)', { a: initialName } );
  }
 else {
    name = initialName;
  }
  const lockNames = Object.keys( locks ).filter( ( thatName ) => locks[thatName] && thatName !== 'status' && thatName !== 'lastActivityAt' );
  let message;
  if ( lockNames.length === 1 && lockNames[0] === 'summary' ) {
    message = translate( '{a} is here on the summary', { a: name } );
  }
 else if ( lockNames.length === 1 && lockNames[0] === 'library' ) {
    message = translate( '{a} is in the library', { a: name } );
  }
 else if ( lockNames.length === 1 && lockNames[0] === 'sections' ) {
      const sectionId = locks.sections.blockId;
      const section = sections[sectionId];
      const sectionTitle = section.metadata.title;
      message = translate( '{a} is working on section "{t}"', { a: name, t: abbrevString( sectionTitle, 60 ) } );
  }
  else if ( lockNames.length === 1 && lockNames[0] === 'settings' ) {
     message = translate( '{a} is working on design', { a: name } );
  }
  else if ( lockNames.length > 1 ) {
    const oLockNames = lockNames.filter( ( n ) => n !== 'summary' );
    if ( oLockNames.length === 1 ) {
      const lockName = oLockNames[0];
      if ( lockName === 'storyMetadata' ) {
        message = translate( '{a} is editing story settings', { a: name } );
      }
      else message = translate( '{a} is working on {l}', { a: name, l: oLockNames[0] } );
    }
    else {
      if ( lockNames[0] === 'library' && lockNames[1] === 'resources' ) {
        message = translate( '{a} is editing an item in the library', { a: name } );
      }
 else if ( lockNames[0] === 'sections' && lockNames[1] === 'resources' ) {
        const sectionId = locks.sections.blockId;
        const section = sections[sectionId];
        const sectionTitle = section.metadata.title;
        message = translate( '{a} is editing an item from library while editing section {s}', { a: name, s: sectionTitle } );
      }
      else message = translate( '{a} is working on {l} and {n}', { a: name, l: lockNames[0], n: lockNames[1] } );
    }
  }
  else {
    message = translate( '{a} is nowhere, alone in the dark', { a: name } );
  }

  return (
    <div
      data-tip={ clickable ? translate( 'click to add this name to authors list' ) : undefined }
      data-for={ clickable ? 'tooltip' : undefined }
      data-effect={ 'solid' }
      onClick={ onClick }
      style={ { cursor: clickable ? 'pointer' : '' } }
    >
      <StretchedLayoutContainer isDirection={ 'horizontal' }>
        <StretchedLayoutItem
          style={ { marginRight: '1rem' } }
        >
          <Image
            isRounded
            isSize={ '32x32' }
            src={ require( `../../../sharedAssets/avatars/${author.avatar}` ) }
          />
        </StretchedLayoutItem>
        <StretchedLayoutItem isFlex={ 1 }>
          <Help>
            {message}
          </Help>
        </StretchedLayoutItem>
      </StretchedLayoutContainer>
    </div>
  );
};

export default AuthorItem;
