/**
 * Translations importer
 */
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var argv = require('optimist').argv;
var po2json = require('po2json');

var importTranslationsFromPo = function() {
  console.log(colors.green('Begining to import all translations from .po translation files'));
  const localesPath = path.resolve(__dirname, argv.locales);
  const localesFiles = fs.readdirSync(localesPath);
  const srcPath = path.resolve(__dirname, argv.src);
  const localesSources = fs.readdirSync(srcPath);
  localesSources.forEach(function (fileName) {
    const lang = fileName.split('.')[0];
    console.log(colors.green('importing locale files for ', lang));
    const json = po2json.parseFileSync(srcPath + '/' + fileName);
    const clean = Object.keys(json).reduce(function(results, key) {
      if (key.length > 0) {
        results[key] = json[key][1];
      }
      return results;
    }, {});
    if (clean) {
      fs.writeFileSync(localesPath + '/' + lang + '.json', JSON.stringify(clean, null, 2));
    }
  })
  console.log(colors.green('Import done for all translations files !'));
}

importTranslationsFromPo();

module.exports = importTranslationsFromPo;