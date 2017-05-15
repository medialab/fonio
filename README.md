# [WIP] Fonio - *data stories editor*

Fonio is a tool dedicated to the making of webpages telling stories with datasets, called *data stories*.
Users import their data from their computer, then compose their data stories, then finally export it to static html or to a web publication.

Users personal data is stored on the `localStorage` of the user's browser, nevertheless it can also be synchronized with a [gist](https://gist.github.com/) code repository and/or with a distant backend server.

Fonio is part of the ``quinoa`` project family, a suite of digital storytelling tools tailored for the [FORCCAST](https://forccast.hypotheses.org/) pedagogical program and [médialab sciences po](http://www.medialab.sciences-po.fr/) scientific activities.

# Features

... WIP

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

For now Fnoio deploys to a [surge](http://surge.sh/) instance for preproduction tests. If you plan to do the same, be sure to change the `CNAME` file to your own destination, then :

```
npm run deploy
```

Fonio does not need a backend for composing presentations and storing them on the localStorage. Nevertheless, Fonio needs an instance of [quinoa server](https://github.com/medialab/quinoa-server) application available in order to be able to handle all-in-one html bundling, oAuth connection to github/gist and exports to distant server. 

It also needs a [youtube API key](https://developers.google.com/youtube/registering_an_application) if you want to be able to retrieve metadata from youtube assets.
