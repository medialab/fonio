/**
 * Webpack configuration for handling the applicatino's source code
 * in production mode (standard + minify)
 */
var webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var sharedConfig = require('./webpack.config.shared');

module.exports = {

  module: sharedConfig.module,

  plugins: sharedConfig.plugins
    .concat(new UglifyJsPlugin())
    .concat(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })),

  devtool: 'source-map',

  output: {
    path: '/build',
    publicPath: '@@URL_PREFIX@@/build/'
  }
};
