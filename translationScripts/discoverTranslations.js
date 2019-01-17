/**
 * Translations keys parser
 */
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var argv = require('optimist').argv;
var wrench = require('wrench');

var discoverTranslations = function() {
  console.log(colors.green('Begining to discover translations needs in source code files'));
  // source files root to parse
  const src = path.resolve(__dirname + '/' + argv.src);
  // name space function used in source code files to namespace translations keys
  const nameSpacer = argv.namespacer;
  const nameSpacerRegex = new RegExp(nameSpacer + '\\([^\']*\'' + '([^\']*)');
  // function used to look for in the source files for translations keys
  const translatorFn = argv.translatorFn;
  const fnRegex = new RegExp (translatorFn + '\\([^\']*\'' + '([^\']*)', 'g');

  // recursively list all files
  const files = wrench.readdirSyncRecursive(src).filter(fileName => fileName.split('.').pop() === 'js');
  var matches = [];
  files.map(fileRelPath => {
    // console.log(colors.green('parsing ', fileRelPath));
    const content = fs.readFileSync(src + '/' + fileRelPath, 'utf-8');
    const match = content.match(nameSpacerRegex);
    if (match) {
      const localNameSpace = match[1];
      var found = null;
      while ((found = fnRegex.exec(content)) !== null) {
        const key = localNameSpace + '.' + found[1];
        console.log(colors.green('found translation entry "'+ key + '" in ' + fileRelPath));
        matches.push(key);
      }
    }
  });
  // listing all unique keys
  const keys = matches.reduce((result, key) => {
    result[key] = key;
    return result;
  }, {});
  // updating json files
  console.log(colors.green('Done discovering all translations keys, begining to update all translations json files'));
  const localesPath = path.resolve(__dirname, argv.locales);
  const localesFiles = fs.readdirSync(localesPath);
  const locales = localesFiles.map(fileName => {
    return {
      fileName,
      translations: require(argv.locales + '/' + fileName)
    }
  });
  const msgs = [];

  locales.forEach(locale => {
    // Object.keys(keys).map(key => {
    //   if (locale.translations[key] === undefined) {
    //     const shortKey = key.split('.').pop();
    //     locale.translations[key] = shortKey;
    //     console.log(colors.red('Automatically adding the key ' + shortKey + ' to locale ' + locale.fileName));
    //   }
    // });
    const newTranslations = Object.assign({}, locale.translations);
    Object.keys(keys).map(key => {
      if (locale.translations[key] !== undefined) {
        const shortKey = key.split('.').pop();
        newTranslations[key] = locale.translations[key];
        console.log(colors.green(shortKey + ' for locale ' + locale.fileName + ' already exists'));
      } else {
        const shortKey = key.split('.').pop();
        newTranslations[key] = shortKey;
        console.log(colors.red('Automatically adding the key ' + shortKey + ' to locale ' + locale.fileName));
      }
    });
    locale.translations = newTranslations;
  });

  locales.forEach(locale => {
    fs.writeFileSync(localesPath + '/' + locale.fileName, JSON.stringify(locale.translations, null, 2));
  });
  console.log(colors.green('Done discovering translations needs in source code files'));
}

discoverTranslations();

module.exports = discoverTranslations;