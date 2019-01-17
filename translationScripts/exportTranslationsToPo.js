/**
 * Translations exporter
 */
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var argv = require('optimist').argv;
var json2po = require('json2po');

var exportTranslationsToPo = function() {
  console.log(colors.green('Begining to export all translations to .po translation files'));
  const localesPath = path.resolve(__dirname, argv.locales);
  const localesFiles = fs.readdirSync(localesPath);
  const destPath = path.resolve(__dirname, argv.dest);
  localesFiles.forEach(function (fileName) {
    const lang = fileName.split('.')[0];
    const data = require(localesPath + '/' + fileName);
    const po = json2po(
      JSON.stringify(data),
       {
          "Project-Id-Version": "Sample Project",
          "PO-Revision-Date": new Date(),
          "Language": lang
       }
      );
    const output = destPath + '/' + lang + '.po';
    fs.writeFileSync(output, po);
  })
  console.log(colors.green('Export done for all translations files !'));
}

exportTranslationsToPo();

module.exports = exportTranslationsToPo;