var path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackBuildNotifierPlugin = require("webpack-build-notifier");
const BitBarWebpackProgressPlugin = require("bitbar-webpack-progress-plugin");
const commonConf = require('./webpack.common.config.js');
commonConf.output.path = path.join(__dirname + '/dist-dev')
commonConf.module.rules[0].use.unshift({
  loader: 'angular-hot-loader',
  options: {
    log: false,
    rootElement: 'html'
  }
})
module.exports = Object.assign({
  name: 'ui',
  entry: {
    ui: './app/index.ts',
    'webpack-dev-server-client': 'webpack-dev-server/client'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['ui'],
      filename: 'index.html',
      template: 'app/index.pug'
    }),
    new ExtractTextPlugin('styles.css'),
    new BitBarWebpackProgressPlugin(),
    new WebpackBuildNotifierPlugin({
      title: "Webpack Build"
    })    
  ]
}, commonConf)
