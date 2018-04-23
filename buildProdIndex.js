const fs = require('fs-extra');
const devIndexPath = __dirname + '/index.html';
const bundlePath = __dirname + '/build/bundle.js';
const prodIndexPath = __dirname + '/index.prod.html';

const buildExpr = /<script type="text\/javascript" src=".\/build\/bundle.js"><\/script>/;

let initialHtml;
fs.readFile(devIndexPath, 'utf8')
  .then(str => {
    initialHtml = str;
    return fs.readFile(bundlePath, 'utf8')
  })
  .then(str => {
    const bundleJS = str;

    const prodHtml = initialHtml.replace(buildExpr, `<script type="text/html">
      ${bundleJS}
</script>`);
    return fs.writeFile(prodIndexPath, prodHtml, 'utf8')
  })
  .then(() => console.log('successfully built prod index.html'))
  .catch((e) => console.log('error while building prod index.html', e))