import postcss from 'postcss';
import prefixer from 'postcss-prefix-selector';
import autoprefixer from 'autoprefixer';


export const processCustomCss = (css = '') => {
  try {
      return postcss().use(prefixer({
        prefix: '.quinoa-story-player',
        // exclude: ['.c'],

        // Optional transform callback for case-by-case overrides
        transform (prefix, selector, prefixedSelector) {
          if (selector === 'body') {
            return 'body.' + prefix;
          }
 else {
            return prefixedSelector;
          }
        }
      }))
      .use(autoprefixer)
      .process(css).css;
  }
 catch (e) {
    return undefined;
  }
};
