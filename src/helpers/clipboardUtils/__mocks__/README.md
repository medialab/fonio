# Generate mocked data for copy/paste utils test

## copyTests.json (mocked data for editor copied from inside fonio)

```
{
  name, // name of test case
  editorFocus, // focused editor when copy ('main' or 'note')
  data: {
    sections, // for test purpose, only one section should inside the story, if editorFocus is note, only one note is required
    sectionsOrder,  // for test purpose, only one section should inside the story
    resources,
    contextualizations,
    contextualizers,
  }
}
```

## pasteOutsideTests.json (mocked data for paste from outside fonio)

```
  {
    name, // name of test case
    html, // html text copied from outside
    resources, // exist resources in story
    expectedResourcesToAdd, // number of resources retrieved from html
    expectedContextualizationsToAdd, // number of contextualizations should be created from html
    expectedContextualizersToAdd, // number of contextualizers created from html
    expectedImagesToAdd, // number of images retrieved from html
  }
```
## pasteInsideTests.json (mocked data for target editor pasted to inside fonio)

```
{
  name, // name of test case
  editorFocus, // focused editor when paste ('main' or 'note')
  data: {
    sections, // for test purpose, only one section should inside the story, if editorFocus is note, only one note is required
    sectionsOrder,  // for test purpose, only one section should inside the story
  }
}
```