# Fonio - *a scholarly dissertations editor allowing to build standalone HTML webpages*

Fonio is a collaborative edition tool dedicated to the making of webpages telling stories with rich contents.

Fonio is part of the ``quinoa`` project family, a suite of digital storytelling tools tailored for the [FORCCAST](http://controverses.org/) pedagogical program and [médialab sciences po](http://www.medialab.sciences-po.fr/) scientific activities.

It is coupled with the [quinoa-server](https://github.com/medialab/quinoa-server) application which provides a server to store stories and handle collaborative edition.

# Requirements

* [git](https://git-scm.com/)
* [node](https://nodejs.org/en/)

# Installation

```
git clone https://github.com/medialab/fonio
cd fonio
npm install
cp config/sample.json config/default.json
```

Then edit the ``config/default.json`` file with your own data.

# Development

```
npm run dev
```

Fonio is compatible with the [Redux Devtools](https://github.com/gaearon/redux-devtools) browser extension for an optimal developer experience.

# Contributing

See the [contributing guide](https://github.com/medialab/fonio/blob/master/CONTRIBUTING.md) in order to give a hand on translations, report bugs, or propose pull requests.

# Other scripts

```
npm run build # builds the app to build dir
npm run lint # lints (auto-fix on) the js code
npm run comb # prettifies (s)css code
npm run test # launch tests for all .spec.js suffixed js scripts within src dir

# translation management

npm run translations:backfill # backfills untranslated keys with default language

npm run translations:discover # updates json translation files with missing translation keys, removes deprecated keys

npm run translations:export:to:po # exports the contents of /src/translations/*.json files to /translations/*.po files (format for professional translation software)

npm run translations:import:from:po # imports the contents of /src/translations/*.json files from /translations/*.po files (format for professional translation software)

npm run translations:update:po # fills po files with untranslated keys

npm run translations:update # backfills, discovers and updates po files

npm run translations:addlanguage # automated files manipulations for adding a locale

npm rnu translations:gitaddpo # adds to git the new translations files
```

# Precomit hook

The project uses a precommit hook before each commit to ensure the code remains clean at all times. Check out the `package.json` to learn more about it.



