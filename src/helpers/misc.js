

export const abbrevString = (str, maxLength = 10) => {
  if (str.length > maxLength) {
   return str.substr(0, maxLength) + '...';
  }
  return str;
};

export const splitPathnameForSockets = (url) => {
  const h = url.split('//'),
        p = h.slice(-1)[0].split('/');

  return [
    (h.length > 1 ? (h[0] + '//') : '') + p[0],
    p.slice(1).filter(i => i)
  ];
};
