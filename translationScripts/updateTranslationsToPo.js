/**
 * Translations reconcilier
 */
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var argv = require('optimist').argv;
var json2po = require('json2po');
var po2json = require('po2json');

var updateTranslationsToPo = function() {
  console.log(colors.green('Begining to update po files with translations to .po translation files'));
  const localesPath = path.resolve(__dirname, argv.locales);
  const localesFiles = fs.readdirSync(localesPath);
  const destPath = path.resolve(__dirname, argv.dest);
  const poFiles = fs.readdirSync(destPath);
  poFiles.forEach(function (fileName) {
    const lang = fileName.split('.')[0];
    console.log(colors.green('inspecting locale files for ', lang));
    const json = po2json.parseFileSync(destPath + '/' + fileName);
    const data = Object.keys(json).reduce(function(results, key) {
      if (key.length > 0) {
        results[key] = json[key][1];
      }
      return results;
    }, {});
    if (data) {
      const js = require(localesPath + '/' + lang + '.json');
      var toUpdate = false;
      Object.keys(js).forEach(function(key) {
        if (data[key] === undefined) {
          console.log(colors.red(key + ' key is not present in po files for lang ' + lang + ', adding it'));
          data[key] = js[key];
          toUpdate = true;
        }
      });

      if (toUpdate) {
        console.log(colors.green('updating po file ' + fileName));
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
        console.log(colors.green('update done for po file ' + fileName));
      }
    }
  })
  console.log(colors.green('Update done for all translations files ! You can now work with the Po files'));
}

updateTranslationsToPo();

module.exports = updateTranslationsToPo;