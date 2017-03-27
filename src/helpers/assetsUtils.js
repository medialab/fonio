

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

export function mediaUrlIsValid(url) {
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
