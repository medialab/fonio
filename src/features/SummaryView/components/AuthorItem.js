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
} ) => {

  /**
   * Computed variables
   */
  const { name, locks = {} } = author;
  const lockNames = Object.keys( locks ).filter( ( thatName ) => locks[thatName] );
  let message;
  if ( lockNames.length === 1 && lockNames[0] === 'summary' ) {
    message = translate( '{a} is here on the summary', { a: name } );
  }
  else if ( lockNames.length > 1 ) {
    const oLockNames = lockNames.filter( ( n ) => n !== 'summary' );
    const hasSection = lockNames.find( ( n ) => n === 'sections' ) !== undefined;
    if ( oLockNames.length === 1 || hasSection ) {
      const lockName = oLockNames[0];
      if ( hasSection ) {
        const lock = locks[lockName];
        if ( lock ) {
          const sectionId = locks.sections.blockId;
          const section = sections[sectionId];
          const sectionTitle = section.metadata.title;
          message = translate( '{a} is working on section "{t}"', { a: name, t: abbrevString( sectionTitle, 60 ) } );
        }
        else message = translate( '{a} is working on a section', { a: name } );
      }
      else if ( lockName === 'storyMetadata' ) {
        message = translate( '{a} is editing story settings', { a: name } );
      }
      else message = translate( '{a} is working on {l}', { a: name, l: oLockNames[0] } );
    }
    else {
      message = translate( '{a} is working on {l} and {n}', { a: name, l: lockNames[0], n: lockNames[1] } );
    }
  }
  else {
    message = translate( '{a} is nowhere, alone in the dark', { a: name } );
  }

  return (
    <StretchedLayoutContainer
      isDirection={ 'horizontal' }
    >
      <StretchedLayoutItem style={ { marginRight: '1rem' } }>
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
  );
};

export default AuthorItem;
