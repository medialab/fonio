/**
 * Webpack configuration for handling the application's source code
 * in development mode (standard)
 */
var webpack = require('webpack');
var sharedConfig = require('./webpack.config.shared');

module.exports = {
  module: sharedConfig.module,
  plugins: sharedConfig.plugins.concat(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }))
};