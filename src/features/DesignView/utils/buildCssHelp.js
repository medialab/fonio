export default ( translate ) => [
  {
    action: translate( 'Change the paragraphs font size' ),
    code: `
.content-p{
  font-size: 10px;
}`
  },
  {
    action: translate( 'Change the background color' ),
    code: `
.wrapper, .nav{
  background: white;
}`
  },
  {
    action: translate( 'Change the titles color' ),
    code: `
.content-h1,.content-h2,.section-title
{
  color: blue;
}`
  }
  ];
