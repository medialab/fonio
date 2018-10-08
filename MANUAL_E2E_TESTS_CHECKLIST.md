Manual end-to-end tests checklists
===

This document lists all user stories that *should* be manually tested before releasing a new version of Fonio.

All of these tests have to be valid on 3 following platforms: 

* Latest Chrome browser
* Latest Firefox browser


# Home view


| user story | Chrome | Firefox |
| --- | --- | --- | --- |
| Create a story from scratch | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Search a specific story by its title | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Order stories by "title" | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Order stories by "last edited" | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Order stories by "last edited by me" | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Create a story by importing an existing valid story | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Create a story by importing an existing badly json-formatted story -> should refuse | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Create a story by importing an existing a non schema-compliant story -> should refuse | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Change a story password | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Duplicate a story | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Delete a story | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Change nickname and/or avatar icon | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |

# Edition views : general


| user story | Chrome | Firefox |
| --- | --- | --- | --- |
| Toggle language | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Change nickname and/or avatar icon | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Come back to home | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Export to JSON (plain) | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Export to JSON (with images and tables - and try to import again) | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Export to standalone HTML | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |


# Summary view

| user story | Chrome | Firefox |
| --- | --- | --- | --- |
| Open a story metadata | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Change story metadata | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Change sections level | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Change sections order (through drag, through buttons) | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Delete a section | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |

# Section view

| user story | Chrome | Firefox |
| --- | --- | --- | --- |
| Write contents | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Write contents using GUI for formatting | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Write contents using markdown contents for formatting | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| create an inline contextualization through drag&drop | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| create an inline contextualization through prompt+selection in the contextual list | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| create an inline contextualization through prompt+selection in the contextual list | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| create an inline contextualization through prompt+selection in the left panel | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| create an inline contextualization through prompt+selection in the left panel | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| create a block contextualization through drag&drop | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| create a block contextualization through drag&drop | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| create a block contextualization through prompt+selection in the contextual list | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| create a block contextualization through prompt+selection in the contextual list | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| create a block contextualization through prompt+selection in the left panel | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| create a block contextualization through prompt+selection in the left panel | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| delete an inline contextualization | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| delete a block contextualization | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from external webpage/text editor | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from the same section | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from the same section | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from the same section | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from another section | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from another section | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from another section | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content to an external webpage/text editor | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from note to note | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from note to note | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from note to main editor | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from note to main editor | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from main editor to note | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from main editor to note | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from main editor to note | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from note to note in different sections | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| paste content from note to note in different sections | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| create a note | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| create a note with shortcut(cmd + '^') | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| delete a note by deleting its pointer | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| delete a note by deleting its editor | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| switch focus between notes and editor | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| undo-redo on plain text | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| undo-redo on plain text | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| undo-redo on note creation | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| undo-redo on note deletion | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| undo-redo on contextualization deletion | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| undo-redo on contextualization deletion | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Change current section title | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Change current section authors | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Change sections level | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Change sections order (through drag, through buttons) | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Delete a section | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Create a single resource (of each type) | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Edit and update a resource (of each type) | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Test valid batch d&d resources addition | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Test invalid batch d&d resources addition (too much files) | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Test invalid batch d&d resources addition (too big files) | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Test invalid batch d&d resources addition (unsupported files) | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Delete a resource | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Search a resource through its title | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Change resources sorting rules | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Filter resources by resource type | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Set an image resource as cover image | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |

# Library view

| user story | Chrome | Firefox |
| --- | --- | --- | --- |
| Create a single resource (of each type) | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Edit and update a resource (of each type) | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Test valid batch d&d resources addition | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Test invalid batch d&d resources addition (too much files) | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Test invalid batch d&d resources addition (too big files) | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Test invalid batch d&d resources addition (unsupported files) | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Delete a resource | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Search a resource through its title | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Change resources sorting rules | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Filter resources by resource type | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Show only editable resources | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Show only unused resources | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Select/deselect all resources | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Delete a selection of resource | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Set an image resource as cover image | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |

# Design view

| user story | Chrome | Firefox |
| --- | --- | --- | --- |
| Change notes position | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Change types of items to show in references | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Change status of items to show in references | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Add custom css rules | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Add custom css rules from helper modal | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Print preview | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |


# Readonly view

| user story | Chrome | Firefox |
| --- | --- | --- | --- |
| Print page | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |
| Come back to home | <ul><li>[ ] check</li></ul> | <ul><li>[ ] check</li></ul> |


