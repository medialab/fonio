/**
 * Imports Libraries
 */
import React from 'react';
import {
  Title,
  StretchedLayoutContainer,
  StretchedLayoutItem,
  Image,
  HelpPin,
  Button
} from 'quinoa-design-library/components/';

const ProfileWidget = ( {
  translate,
  onEdit,
  userInfo,
} ) => {
  return (
    <div>
      <Title isSize={ 5 }>
        {translate( 'Your profile' )}
        <HelpPin>{translate( 'choose how you will be identified by other writers' )}</HelpPin>
      </Title>
      {userInfo !== undefined &&
        <StretchedLayoutContainer isDirection={ 'horizontal' }>
          <StretchedLayoutItem style={ { display: 'flex', alignItems: 'center' } }>
            <Image
              isRounded
              isSize={ '64x64' }
              src={ require( `../../../sharedAssets/avatars/${userInfo.avatar}` ) }
            />
          </StretchedLayoutItem>
          <StretchedLayoutItem
            style={ { paddingRight: '1rem', paddingLeft: '1rem', display: 'flex', alignItems: 'center' } }
            isFlex={ 1 }
          >
            {userInfo.name}
          </StretchedLayoutItem>
          <StretchedLayoutItem style={ { display: 'flex', alignItems: 'center', paddingRight: '1rem' } }>
            <Button onClick={ onEdit }>
              {translate( 'edit' )}
            </Button>
          </StretchedLayoutItem>
        </StretchedLayoutContainer>
      }
    </div>
  );
};

export default ProfileWidget;
