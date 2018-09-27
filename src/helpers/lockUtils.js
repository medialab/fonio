/**
 * This module helps to compute data from the raw locksystem map
 * @module fonio/utils/lockUtils
 */

export const getReverseSectionsLockMap = ( lockingMap = {}, activeUsers = {}, storyId ) => {
  if ( lockingMap[storyId] && lockingMap[storyId].locks ) {
    return Object.keys( lockingMap[storyId].locks )
      .reduce( ( result, thatUserId ) => {
        const userSectionLock = lockingMap[storyId].locks[thatUserId].sections;
        if ( userSectionLock ) {
          return {
            ...result,
            [userSectionLock.blockId]: {
              ...activeUsers[userSectionLock.userId]
            }
          };
        }
        return result;
      }, {} );
  }
  return {};
};

export const getReverseResourcesLockMap = ( lockingMap = {}, activeUsers = {}, storyId ) => {
  if ( lockingMap[storyId] && lockingMap[storyId].locks ) {
    return Object.keys( lockingMap[storyId].locks )
      .reduce( ( result, thatUserId ) => {
        const userResourceLock = lockingMap[storyId].locks[thatUserId].resources;
        if ( userResourceLock ) {
          return {
            ...result,
            [userResourceLock.blockId]: {
              ...activeUsers[userResourceLock.userId]
            }
          };
        }
        return result;
      }, {} );
  }
  return {};
};

export const getCitedSections = ( contextualizations, resourceId ) => {
  const sections = Object.keys( contextualizations ).map( ( id ) => contextualizations[id] )
                  .filter( ( d ) => d.resourceId === resourceId )
                  .map( ( d ) => d.sectionId );
  return [ ...new Set( sections ) ];
};

export const getStoryActiveUsersIds = ( lockingMap, storyId ) => {
  if ( lockingMap[storyId] && lockingMap[storyId].locks ) {
    return Object.keys( lockingMap[storyId].locks );
  }
  return [];
};

export const getStoryActiveAuthors = ( lockingMap = {}, activeUsers = {}, storyId ) => {
  if ( lockingMap[storyId] && lockingMap[storyId].locks ) {
    const storyActiveUsersIds = getStoryActiveUsersIds( lockingMap, storyId );
    return Object.keys( activeUsers )
      .filter( ( thatUserId ) => storyActiveUsersIds.indexOf( thatUserId ) !== -1 )
      .map( ( thatUserId ) => ( {
        ...activeUsers[thatUserId],
        locks: lockingMap[storyId].locks[thatUserId]
      } ) );
  }
  return [];
};

export const checkIfUserHasLockOnMetadata = ( lockingMap = {}, userId, storyId ) => {
  if ( lockingMap[storyId] && lockingMap[storyId].locks ) {
    const user = lockingMap[storyId].locks[userId];
    if ( user ) {
      return user.storyMetadata !== undefined;
    }
    return false;
  }
  return false;
};

export const checkIfUserHasLockOnSection = ( lockingMap = {}, userId, storyId, sectionId ) => {
  if ( lockingMap[storyId] && lockingMap[storyId].locks ) {
    const user = lockingMap[storyId].locks[userId];
    if ( user ) {
      return user.sections !== undefined && user.sections.blockId === sectionId;
    }
    return false;
  }
  return false;
};

export const getUserResourceLockId = ( lockingMap = {}, userId, storyId ) => {
  if ( lockingMap[storyId] && lockingMap[storyId].locks ) {
    const user = lockingMap[storyId].locks[userId];
    if ( user ) {
      return user.resources && user.resources.blockId;
    }
    return undefined;
  }
  return undefined;
};
