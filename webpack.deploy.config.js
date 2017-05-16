var path = require("path");
var webpack = require("webpack");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var GhPagesWebpackPlugin = require('gh-pages-webpack-plugin');

var conf = require('./webpack.dist.config.js');
conf.plugins.push(new GhPagesWebpackPlugin({
   path: './dist'
}))

module.exports = conf
