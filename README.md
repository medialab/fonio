# Fonio - *data stories editor*

Fonio is a tool dedicated to the making of webpages telling stories with datasets, called *data stories*.
Users import their data from their computer, then compose their data stories, then finally export it to static html or to a web publication.

Users personal data is stored on the `indexedDb` of the user's browser, nevertheless it can also be synchronized with a [gist](https://gist.github.com/) code repository and/or with a distant backend server.

Fonio is part of the ``quinoa`` project family, a suite of digital storytelling tools tailored for the [FORCCAST](http://controverses.org/) pedagogical program and [médialab sciences po](http://www.medialab.sciences-po.fr/) scientific activities.

It is supposed to be used along with the [bulgur](https://github.com/medialab/bulgur) project, which allows to make "data presentations" to be embed in data stories.

# Features

Create a new story :

* set story-level metadata which will be consumed for SEO-friendly html outputs
* set section-level metadata (chapters, sections) that can have their own authors and description.

Import a story :

* import from a story json file
* import from a forccast or gist url

Write a rich story with a wysiwyg editor :

* write your content with a seamless editing interface
* use markdown shortcuts if you're familiar with the language
* write footnotes connected to your main text
* embed resources within your text thanks to drag&drop or resource picking inteface within the text editor

Embed and manage various resources :

* embed data presentations to build data-based arguments within your story
* embed images, videos, and embed code coming from web services
* embed academic references in various formatting styles and languages - you can import citation data in bibTeX format or edit it manually thanks to a graphical interface

Output your data to high-quality and very robust documents :

* choose a stories template and personalize it with custom css code and various examples
* save your document as a all-in-one html document that can be hosted on any server/service later on

Keep your data on your browser or synchronize it with distant sources :

* store data on browser's local storage
* import and export data relative to a specific story from a forccast server repository
* import and export data relative to a specific story from a gist repository

# Requirements

* [git](https://git-scm.com/)
* [node](https://nodejs.org/en/)
* [API secret and user ID for your implementation of the application](https://github.com/settings/applications/new) if you plan to enable gist exports

# Installation

```
git clone https://github.com/medialab/fonio
cd fonio
npm install
cp secrets.sample.json secrets.json
```

Then edit the ``secrets.json`` file with your own data.

# Development

```
npm run dev
```

Fonio is compatible with the [Redux Devtools](https://github.com/gaearon/redux-devtools) browser extension for an optimal developer experience.

# Contributing

See the [contributing guide](https://github.com/medialab/fonio/blob/master/CONTRIBUTING.md) in order to give a hand on translations, report bugs, or propose pull requests.

# Deployment

Fonio does not need a backend for composing presentations and storing them on the localStorage. Nevertheless, Fonio needs an instance of [quinoa server](https://github.com/medialab/quinoa-server) application available in order to be able to handle all-in-one html bundling, oAuth connection to github/gist and exports to distant server. 

It also needs a [youtube API key](https://developers.google.com/youtube/registering_an_application) if you want to be able to retrieve metadata from youtube assets.

For now Fonio deploys to a [surge](http://surge.sh/) instance for preproduction tests. If you plan to do the same, be sure to change the `CNAME` file to your own destination, then :

```
npm run deploy
```

# Other scripts

```
npm run build # builds the app to build dir
npm run lint # lints (auto-fix on) the js code
npm run comb # prettifies scss code
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



