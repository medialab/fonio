import {
  get
} from 'superagent';

import Cite from 'citation-js';

export function fileIsAnImage(file) {
  return new Promise((resolve, reject) => {
    const validExtensions = ['gif', 'png', 'jpeg', 'jpg'];
    const extension = file.name.split('.').pop();
    if (validExtensions.indexOf(extension) > -1) {
      resolve(file);
    }
 else {
      reject();
    }
  });
}

export function videoUrlIsValid(url) {
  return new Promise((resolve, reject) => {
    const validUrlParts = ['youtube', 'vimeo'];
    const hasMatch = validUrlParts.some(exp => url.match(exp) !== null);
    if (hasMatch) {
      resolve(url);
    }
 else {
      reject();
    }
  });
}

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
      reader = undefined;
    };
    reader.onerror = (event) => {
      reject(event.target.error);
      reader = undefined;
    };
    reader.readAsDataURL(file);
  });
}

const youtubeRegexp = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/gi;
const vimeoRegexp = /^(https?\:\/\/)?(www\.)?(vimeo\.com)/gi;
export function retrieveMediaMetadata (url, credentials = {}) {
  return new Promise((resolve) => {
    if (url.match(youtubeRegexp)) {
      if (credentials.youtubeAPIKey) {
        let videoId = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
        if (videoId !== null) {
           videoId = videoId[1];
            const endPoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${credentials.youtubeAPIKey}`;
            get(endPoint)
              .set('Accept', 'application/json')
              .redirects(2)
              .end((error, res) => {
                if (error) {
                  return resolve({url, metadata: {
                    videoUrl: url
                  }});
                }
                const info = res.body && res.body.items && res.body.items[0] && res.body.items[0].snippet;
                return resolve({
                  url,
                  metadata: {
                    description: info.description,
                    source: info.channelTitle + ` (youtube: ${url})`,
                    title: info.title,
                    videoUrl: url
                  }
                });
              });
      }
 else {
        return resolve({url, metadata: {
        videoUrl: url
      }});
      }
    }
 else {
        return resolve({url, metadata: {
        videoUrl: url
      }});
      }
    }
 else if (url.match(vimeoRegexp)) {
      const endpoint = 'https://vimeo.com/api/oembed.json?url=' + url;
      get(endpoint)
        .set('Accept', 'application/json')
        .end((error, res) => {
          if (error) {
            return resolve({url, metadata: {
        videoUrl: url
      }});
          }
          const data = res.body;
          resolve({
            url,
            metadata: {
              source: data.author_name + ` (vimeo: ${url})`,
              title: data.title,
              description: data.description,
              videoUrl: url
            }
          });
        });
    }
 else {
      return resolve({url, metadata: {
        videoUrl: url
      }});
    }
  });
}

export function parseBibTeXToCSLJSON (str) {
  // forcing references separation to parse a maximum of references, even with shitty formatting
  const refs = str.split('\n\n');
  return refs.reduce((result, ref) => {
    return [
      ...result,
      ...new Cite(ref).get({
        type: 'json',
        style: 'csl'
      })
    ];
  }, []);
}

export function inferMetadata(data, assetType) {
  switch (assetType) {
    case 'video':
      if (data.metadata) {
        return {...data.metadata};
      }
      return {
      };
    case 'data-presentation':
      return {...data.metadata};
    case 'image':
      let title = data && data.file && data.file.name && data.file.name.split('.');
      if (title) {
        title.pop();
        title = title.join('.');
      }
      return {title};
    case 'embed':
    default:
      return {};
  }
}
