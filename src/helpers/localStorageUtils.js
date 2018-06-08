

export const loadStoryToken = storyId => {
  return localStorage.getItem(`fonio/storyToken/${storyId}`);
};
export const saveStoryToken = (storyId, token) => {
  localStorage.setItem(`fonio/storyToken/${storyId}`, token);
};

export const updateEditionHistoryMap = storyId => {
  const existing = localStorage.getItem('fonio/editionStoryMap');
  let previousMap;
  try {
    if (existing) {
      previousMap = JSON.parse(existing);
    }
 else previousMap = {};
  }
 catch (e) {
    previousMap = {};
  }
  const newMap = {
    ...previousMap,
    [storyId]: new Date().getTime()
  };
  localStorage.setItem('fonio/editionStoryMap', JSON.stringify(newMap));
};

export const getEditionHistoryMap = () => {
  const existing = localStorage.getItem('fonio/editionStoryMap');
  try {
    if (existing) {
      return JSON.parse(existing);
    }
 else return {};
  }
 catch (e) {
    return {};
  }
};
