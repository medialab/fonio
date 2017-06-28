/**
 * Translation manager written by Robin de Mourat
 * Backfills untranslated keys with default language.
 * Lets the user know about the process
 */

var fs = require('fs');
var path = require('path');
var colors = require('colors');
var argv = require('optimist').argv;

var backfillTranslations = function() {
  console.log(colors.green('Begining to check all translations'));
  const localesPath = path.resolve(__dirname, argv.locales);
  const localesFiles = fs.readdirSync(localesPath);
  const locales = localesFiles.map(fileName => {
    return {
      fileName,
      translations: require(argv.locales + '/' + fileName)
    }
  });
  const msgs = [];

  locales.forEach(locale1 => {
    Object.keys(locale1.translations).map(key => {
      locales.forEach(locale2 => {
        if (locale1.fileName !== locale2.fileName) {
          if (locale2.translations[key] === undefined) {
            msgs.push({
              type: 'untranslated',
              key: key,
              from: locale1.fileName,
              to: locale2.fileName,
              backfill: locale1.translations[key]
            });
            locale2.translations[key] = locale1.translations[key];
          }
        }
      });
    });
  });

  locales.forEach(locale => {
    fs.writeFileSync(localesPath + '/' + locale.fileName, JSON.stringify(locale.translations, null, 2));
  });
  msgs.forEach(msg => {
    if (msg.type === 'untranslated') {
      var msgC ='Message with key "' + 
                  msg.key + 
                  '" was not translated in language ' + 
                  msg.to.split('.')[0] + 
                  ', it has been backfilled with ' + 
                  msg.from.split('.')[0] + 
                  ' message "' + 
                  msg.backfill + 
                  '". \nGo to ' + 
                  localesPath + 
                  '/' + msg.to + 
                  ' to translate it properly.\n\n';
      console.log(colors.red(msgC));
    }
  })
  console.log(colors.green('Translation maintenance is complete'));
}

backfillTranslations();

module.exports = backfillTranslations;