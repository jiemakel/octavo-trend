var path = require("path");
var webpack = require("webpack");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var GhPagesWebpackPlugin = require('gh-pages-webpack-plugin');

var commonConf = require('./webpack.common.config.js');
commonConf.watch = false
commonConf.output.path = path.join(__dirname + '/dist')

module.exports = Object.assign({
  name: 'ui',
  entry: {
    ui: './app/index.ts'
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['ui'],
      filename: 'index.html',
      template: 'app/index.pug'
    }),
    new ExtractTextPlugin('styles.css'),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.NoEmitOnErrorsPlugin()
  ]
}, commonConf)
