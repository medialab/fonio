/**
 * Translations language adder
 */
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var argv = require('optimist').argv;

var addTranslationLanguage = function() {
  const lang = argv._[0];
  const poPath = argv.poPath || './translations';
  const translationsPath = path.resolve(__dirname, argv['translations-folder']);
  if (lang) {
    // copy translation json
    const modelPath = fs.readdirSync(translationsPath + '/locales')[0];
    const model = fs.readFileSync(translationsPath + '/locales/' + modelPath, 'utf-8');
    fs.writeFileSync(translationsPath + '/locales/' +  lang + '.json', model);
    // update translations index script
    const indexContent = fs.readFileSync(translationsPath + '/index.js', 'utf-8');
    const defRegex = /translations = {/;
    const match = indexContent.match(defRegex);
    if (match) {
      const newIndexContent = 'import ' + lang + ' from \'./locales/' + lang + '\';\n' + indexContent.substr(0, match.index) + match[0] + '\n  ' + lang + ',' + indexContent.substr(match.index + match[0].length);
      fs.writeFileSync(translationsPath + '/index.js', newIndexContent);
      fs.writeFileSync(poPath + '/' + lang + '.po', '');
      console.log(colors.green('done updating code for language ' + lang));
    }
  } else {
    console.log('you must indicate a language code, e.g. "npm run translations:addlanguage it"')
  }
}

addTranslationLanguage();

module.exports = addTranslationLanguage;