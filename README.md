# Fonio - *a scholarly dissertations editor allowing to build standalone HTML webpages*

Fonio is a collaborative writing software aimed at building rich digital scholarly dissertations using the architecture of websites to structure arguments and the possibility to harness the richness of your work by featuring bibliographic references, images, tables, videos, and interactive elements.

Fonio puts an emphasis on documentation, allowing you to describe all the resources gathered during your inquiry in a rich and homogeneous way (date, source, author, ...). It also allows you to build an augmented glossary in order to define key terms and browse them in an interactive way.

Besides, the application is aimed at allowing to work extensively on the information design of your dissertation: choose a way to organize the reading experience of your readers, and customize the visual identity of your work in a meaningful way.

Fonio is collaborative and allows several writers to work simultaneously on contents, design and documentation. According to this collaborative state of mind, works in progress are readable by the whole classroom, but their edition is restricted to your team.

Each "classroom" corresponds to a specific course and exists during a limited period of time. All works are be saved and privately archived after the semester is finished, but the application also allows students to download their work at anytime to backup it or to publish it online in a clean and easy way.

Fonio is part of the ``quinoa`` project family, a suite of digital storytelling tools tailored for the [FORCCAST](http://controverses.org/) pedagogical program and [médialab sciences po](http://www.medialab.sciences-po.fr/) scientific activities.

It works with the [quinoa-server](https://github.com/medialab/quinoa-server) application which provides a server to store stories and handle collaborative edition.

# Requirements

* [git](https://git-scm.com/)
* [node](https://nodejs.org/en/)

# Installation

You have to install both fonio (client) and [quinoa-server](https://github.com/medialab/quinoa-server) to be able to run this application.

Install quinoa-server :

```
git clone https://github.com/medialab/quinoa-server
cd quinoa-server
npm install
cp config/sample.json config/default.json
```

Then edit the ``config/default.json`` file with your own data.


Install fonio :

```
git clone https://github.com/medialab/fonio
cd fonio
npm install
cp config/sample.json config/default.json
```

Then edit the ``config/default.json`` file with your own data.


# Development

For both fonio and quinoa-server, run in two different terminal tabs :

```
npm run dev
```

Fonio is compatible with the [Redux Devtools](https://github.com/gaearon/redux-devtools) browser extension for an optimal developer experience.

# Deployment

Fonio is supposed to run in a docker infrastructure in production.

Please look at the [`docker-compose.yml`](https://github.com/medialab/quinoa-server/blob/master/docker-compose.yml) file present on [quinoa-server](https://github.com/medialab/quinoa-server) repository for that matter.

# Contributing

See the [contributing guide](https://github.com/medialab/fonio/blob/master/CONTRIBUTING.md) in order to give a hand on translations, report bugs, or propose pull requests.

# Other scripts

```
npm run build # builds the app to build dir
npm run lint # lints (auto-fix on) the js code
npm run comb # prettifies (s)css code
npm run test # launch tests for all .spec.js suffixed js scripts within src dir
npm run analyze # analyze webpack bundle

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



