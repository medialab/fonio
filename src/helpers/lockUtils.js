export const getReverseSectionsLockMap = (lockingMap = {}, activeUsers = {}, storyId) => {
  if (lockingMap[storyId] && lockingMap[storyId].locks) {
    return Object.keys(lockingMap[storyId].locks)
      .reduce((result, thatUserId) => {
        const userSectionLock = lockingMap[storyId].locks[thatUserId].sections;
        if (userSectionLock) {
          return {
            ...result,
            [userSectionLock.blockId]: {
              ...activeUsers[userSectionLock.userId]
            }
          };
        }
        return result;
      }, {});
  }
  return {};
};

export const getStoryActiveUsersIds = (lockingMap, storyId) => {
  if (lockingMap[storyId] && lockingMap[storyId].locks) {
    return Object.keys(lockingMap[storyId].locks);
  }
  return [];
};

export const getStoryActiveAuthors = (lockingMap = {}, activeUsers = {}, storyId) => {
  if (lockingMap[storyId] && lockingMap[storyId].locks) {
    const storyActiveUsersIds = getStoryActiveUsersIds(lockingMap, storyId);
    return Object.keys(activeUsers)
      .filter(thatUserId => storyActiveUsersIds.indexOf(thatUserId) !== -1)
      .map(thatUserId => ({
        ...activeUsers[thatUserId],
        locks: lockingMap[storyId].locks[thatUserId]
      }));
  }
  return [];
};

export const checkIfUserHasLockOnMetadata = (lockingMap = {}, userId, storyId) => {
  if (lockingMap[storyId] && lockingMap[storyId].locks) {
    const user = lockingMap[storyId].locks[userId];
    if (user) {
      return user.storyMetadata !== undefined;
    }
    return false;
  }
  return false;
};
