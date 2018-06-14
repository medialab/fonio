/**
 * Webpack configuration base for handling the application's source code
 */
var webpack = require('webpack');
var config = require('config');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(woff|ttf|otf|eot|woff2)$/i,
         use: [
          {
            loader: 'file-loader',
            options: {
              query: {
                name:'assets/[name].[ext]'
              }
            }
          },
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'url-loader?limit=10000',
          'img-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      CONFIG: JSON.stringify(config)
    })
  ]
};