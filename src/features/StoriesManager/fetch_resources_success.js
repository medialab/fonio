case FETCH_RESOURCES + '_SUCCESS':
  newState = {...state};
  resources = newState.activeStory.resources;
  Object.keys(resources)
    .map(key => resources[key])
    .forEach(resource => {
      if (action.result[resource.metadata.id]) {
        resources[resource.metadata.id] = {
          ...resource,
          data: action.result[resource.metadata.id]
        };
      }
      // generate data.url to link to image addr on server
      if (resource.metadata.type === 'image' && !resource.data.url) {
        let ext = '';
        if (resource.metadata.mime)
          ext = resource.metadata.mime.split('/')[1];
        else if (resource.data)
          ext = resource.data.base64.substring('data:image/'.length, resource.data.base64.indexOf(';base64'));

        resources[resource.metadata.id] = {
          ...resource,
          data: {
            url: serverUrl + '/static/' + action.storyId + '/resources/' + resource.metadata.id + '.' + ext
          }
        };
      }
    });
    return {
    ...state,
    activeStory: {
      ...state.activeStory,
      resources: {
        ...state.activeStory.resources,
        ...resources
      }
    }
  };
case UPLOAD_RESOURCE_REMOTE + '_SUCCESS':
      const {
        id: resourceId,
        storyId,
        resource
      } = action;
      let newResource = {...resource};
      if (resource.metadata.type === 'image') {
        const ext = resource.metadata.mime.split('/')[1];
        newResource = {
          ...resource,
          data: {
            url: serverUrl + '/static/' + storyId + '/resources/' + resourceId + '.' + ext
          }
        };
      }
      return {
        ...state,
        activeStory: {
          ...state.activeStory,
          resources: {
            ...state.activeStory.resources,
            [resourceId]: newResource
          }
        }
      };