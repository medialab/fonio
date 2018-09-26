## How Can I Contribute?

### Performing translations

Fonio is internationalized using `.po` files, editable with tools such as [Poedit](https://poedit.net/).

`.po` files are located in `./translations` folder.

If you plan to propose a translation improvement, here is the process to follow:

* install the code locally: `git clone https://github.com/medialab/fonio; npm install`
* run `npm run translations:update` to be sure to work on the latest version of the translations dictionnary
* edit the `.po` file of the locale you want to improve, located in `translations` folder 
* run `npm run translations:import:from:po` to pull back your changes to the code
* verify the result fits with your goal by running `npm run dev`
* if good, push your code and submit a pull request to the repo

If you plan to propose a new language translation, here is the process to follow :

* run `npm run translations:add-language --lang pt` where `pt` is the language code you want to add - source code will be updated accordingly
* run `npm run translations:update` to update the new translation locale with latest data - you will find your ready-to-translate file in `translations` (e.g. `./translations/pt.po`)
* do the translation work on the po file and save it
* run `npm run translations:import:from:po` to update translations back to source code

N.B. : other translations files are present in the `src` folder as `json` files, but these ones are generated from project's script and should not be directly edited as they are overriden by translation-related scripts. You should always work on .po files to perform translations

### Reporting Bugs

This section guides you through submitting a bug report for Fonio. Following these guidelines helps maintainers and the community understand your report :pencil:, reproduce the behavior :computer: :computer:, and find related reports :mag_right:.

#### How Do I Submit A (Good) Bug Report?

Bugs are tracked as [GitHub issues](https://guides.github.com/features/issues/). After you've [searched](https://github.com/medialab/fonio/issues) if your bug is not dealt with in an existing issue of the project, create an issue on that repository.

Explain the problem and include additional details to help maintainers reproduce the problem:

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible. When listing steps, **don't just say what you did, but explain how you did it**. For example, if you moved the cursor to the end of a line, explain if you used the mouse, or a keyboard shortcut.
* **Provide specific examples to demonstrate the steps**. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples. If you're providing snippets in the issue, use [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**
* **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem. You can use [this tool](http://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and [this tool](https://github.com/colinkeenan/silentcast) or [this tool](https://github.com/GNOME/byzanz) on Linux.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Fonio, including completely new features and minor improvements to existing functionality. Following these guidelines helps maintainers and the community understand your suggestion :pencil: and find related suggestions :mag_right:.

Before creating enhancement suggestions, please check in the issues section if there's already an issue addressing this enhancement as you might find out that you don't need to create one. When you are creating an enhancement suggestion, please [include as many details as possible](#how-do-i-submit-a-good-enhancement-suggestion).

#### How Do I Submit A (Good) Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://guides.github.com/features/issues/). Create an issue on that repository and provide the following information:

* **Use a clear and descriptive title** for the issue to identify the suggestion.
* **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
* **Provide specific examples to demonstrate the steps**. Include copy/pasteable snippets which you use in those examples, as [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
* **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
* **Include screenshots and animated GIFs** which help you demonstrate the steps or point out the part of Fonio which the suggestion is related to. You can use [this tool](http://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and [this tool](https://github.com/colinkeenan/silentcast) or [this tool](https://github.com/GNOME/byzanz) on Linux.
* **Explain why this enhancement would be useful** to most Fonio users.

# Contributing to the code : guidelines & information

## Precommit hook

Fonio uses a precommit hook that verifies that linting is alright, that the application still builds successfuly and other good things to check before committing. Precommit tests are automatic.

## Unit tests

Please provide relevant unit tests with any new feature proposal. Unit test scripts must be suffixed with `.spec.js` to be handled by the test script.

## JS guidelines / linting

Fonio uses `eslint` along with a specific config for coding style adopted for the project. Be sure to run `npm run lint` to correct small errors and see what needs to be modified for having a correctly written contribution.

### JS react files headers

All JS react file headers *must* be organized the same way to ease maintenance and reading:

A header component must describe module : what it does and why it exists.

Comments must be annotated and sorted according to following categories :

1. `Import Libraries` -> all external library - a good practice is to put react-related imports at the end of this list
1. `Import Project Utils` -> all local helpers/utils
1. `Import Ducks` -> if relevant, ducks and redux-related import
1. `Import Components` -> all local components
1. `Import Assets` -> style imports, schema imports, and other assets
1. `Shared variables` -> global variables or imports destructuring

Example of header following rules :

```
/**
 * This modules provides the layout of the library feature.
 * @module dicto/features/LibraryView
 */

/**
 * Imports Libraries
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { v4 as genId } from 'uuid';
import { isEmpty, debounce, uniq } from 'lodash';
/**
 * Imports Project utils
 */
import { getResourceTitle, searchResources } from '../../../helpers/resourcesUtils';
/**
 * Imports Components
 */
import PaginatedList from '../../../components/PaginatedList';

/**
 * Imports Assets
 */
import resourceSchema from 'quinoa-schemas/resource';
import config from '../../../config';
/**
 * Shared variables
 */
const { maxBatchNumber, maxResourceSize } = config;
const realMaxFileSize = base64ToBytesLength( maxResourceSize );
const resourceTypes = Object.keys( resourceSchema.definitions );
```

### Jsx: render functions

For lisibility and maintenance, render functions *must* be organized the same way:

```
/**
 * Variables definition
 */
/**
 * Computed varialbes
 */
/**
 * Local functions
 */
/**
 * Callbacks handlers
 */
/**
 * References bindings
 */
 return (...)
```

## Code internationalization / i18n

Quinoa apps use `redux-i18n` module for internationalization.
Translations keys are wrapped within a function that namespaces all translations keys to avoid translation conflicts.

App's workflow eases the process of internationalization by parsing the code and auto-discovering new translation entries thanks to the `translations:discover` script.

To keep up this fluid workflow while updating code with new internationalizable content, you *must* comply to the following rules in order to keep the translation maintenance scripts efficient :

* always use the `translateNameSpacer` wrapping function provided by the `helpers/translateUtils.js` module when calling a translation function
* always build a component-specific translation function named `translate` for the regex to work properly.


Example of parsable internationalized code :

```
import React, {PropTypes} from 'react';

import {translateNameSpacer} from '../../helpers/translateUtils';

// ...

const PresentationCard = ({
    // ...
}, context) => {
  // build the translate function with proper namespace
  const translate = translateNameSpacer(context.t, 'Components.PresentationCard');
  return (
    <li className="fonio-presentation-card">
      <div className="card-body">
            {translate('untitled_presentation')}</span>
      </div>
      // ...
    </li>
  )
};

PresentationCard.contextTypes = {
  t: PropTypes.func.isRequired
}
```

## SCSS guidelines

Each new component *must* be provided with a specific scss file describing this component's styling. All selectors must be namespaced with the class of the root element of the component (which *must* be namespaced with the name of the application, e.g. `fonio-color-picker`) ; do not forget to use [sass nesting feature](http://sass-lang.com/guide/#topic-3) for a well structured code.

### Code organization

Then, all components' scss *may* be structured in the same following way :

1. first put the root component layout generalities
2. then the global displaying style (backgrounds, font sizes)
3. then the selectors for the components reused along the component
4. then, using sass nesting, the specifics of primary, secondary and detail styling for elements within the app

Example :

```
.fonio-my-component-class
{
    /*
     * root component
     */
     font-size: $font-size-1;
    /*
     * specific re-used micro-components
     */
    .my-specific-input
    {

    }
    /*
     * primary layout components
     */
    .my-div-wrapper
    {
         display: flex;
        /*
         * secondary layout components
         */
        .my-div-container
        {

        }
    }
}
```


Please also note that there's a `npm run comb` command available that formats and prettifies all scss files.

### Parametric design

Please use, as much as possible, the scss parameters and abstract classes set in the `./src/parameters.scss` file. They are supposed to keep the project easily configurable in terms of UI/graphic design and to reduce styling code complexity.



