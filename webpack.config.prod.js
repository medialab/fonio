/**
 * Webpack configuration for handling the applicatino's source code
 * in production mode (standard + minify)
 */
var webpack = require('webpack');
const config = require('config');
const urlPrefix = config.get('urlPrefix');

var sharedConfig = require('./webpack.config.shared');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {

  module: sharedConfig.module,

  mode: 'production',

  plugins: sharedConfig.plugins
    /*.concat(new UglifyJsPlugin())*/
    .concat(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }))
    .concat(new BundleAnalyzerPlugin({
      openAnalyzer: false,
      generateStatsFile: true,
      analyzerMode: 'disabled'
    }))
    ,

  // devtool: 'source-map',

  output: {
    path: '/build',
    publicPath: urlPrefix && urlPrefix.length ? urlPrefix + '/build/' : '/build/'
  }
};
