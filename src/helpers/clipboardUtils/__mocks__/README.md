# Generate mocked data for copy/paste utils test

## Mocked data for copy test

```
{
  name, // test name 
  editorFocus, // focused editor when copy ('main' or 'note')
  data: {
    sections, // for test purpose, require only one section
    sectionsOrder,  // for test purpose, require only one section
    resources,
    contextualizations,
    contextualizers,
  }
}
```

## Mocked data for paste from outside fonio

```
  {
    name, // test name 
    html, // html text copied from outside
    resources, // exist resources in story
    expectedResourcesToAdd, // number of resources retrieved from html
    expectedContextualizationsToAdd, // number of contextualizations should be created from html
    expectedContextualizersToAdd, // number of contextualizers created from html
    expectedImagesToAdd, // number of images retrieved from html
  }
```
## Mocked data for paste from inside fonio

```
{
  name, // test name 
  editorFocus, // focused editor when paste ('main' or 'note')
  data: {
    sections, // for test purpose, require only one section
    sectionsOrder,  // for test purpose, require only one section
  }
}
```