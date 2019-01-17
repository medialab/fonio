/**
 * This module provides a component for representing other users active in the classroom
 * @module fonio/features/HomeView
 */
/**
 * Imports Libraries
 */
import React from 'react';
import {
  Title,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  HelpPin,
  Image,
  Content
} from 'quinoa-design-library/components';

const OtherUsersWidget = ( {
  translate,
  users,
  userId,
} ) => {
  return (
    <div>
      {
        users &&
        Object.keys( users )
        .filter( ( thatUserId ) => userId !== thatUserId ).length > 0 &&
        <Title isSize={ 5 }>
          {translate( 'Who else is online ?' )}
          <HelpPin>{translate( 'writers connected to this classroom right now' )}</HelpPin>
        </Title>
      }
      <div style={ { maxHeight: '30rem', overflow: 'auto' } }>
        {users &&
          Object.keys( users )
            .filter( ( thatUserId ) => userId !== thatUserId )
            .map( ( thatUserId ) => ( { userId, ...users[thatUserId] } ) )
            .map( ( user, index ) => {
              return (
                <StretchedLayoutContainer
                  style={ { marginBottom: '1rem' } }
                  isDirection={ 'horizontal' }
                  key={ index }
                >
                  <StretchedLayoutItem style={ { maxWidth: '3rem', minWidth: '3rem' } }>
                    <Image
                      isRounded
                      isSize={ '32x32' }
                      src={ require( `../../../sharedAssets/avatars/${user.avatar}` ) }
                    />
                  </StretchedLayoutItem>
                  <StretchedLayoutItem isFlex={ 1 }>
                    <Content>
                      {user.name}
                    </Content>
                  </StretchedLayoutItem>
                </StretchedLayoutContainer>
              );
            } )
          }
      </div>
    </div>
  );
};

export default OtherUsersWidget;
