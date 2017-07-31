/**
 * Webpack configuration for handling the applicatino's source code
 * in production mode (standard + minify)
 */
var webpack = require('webpack');
var UglifyEsPlugin = require('uglify-es-webpack-plugin');

var sharedConfig = require('./webpack.config.shared');

module.exports = {
  module: sharedConfig.module,
  plugins: sharedConfig.plugins
    .concat(new UglifyEsPlugin())
    .concat(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }))
};
