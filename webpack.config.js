var glob = require("glob");
var path = require("path");
var webpack = require("webpack");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var commonConf = {
  cache: true,
  watch: true,
  devtool: 'cheap-module-eval-source-map',
  context: __dirname,
  output: {
    filename: '[name]-bundle.js',
    path: path.join(__dirname + '/dist'),
    publicPath: 'http://localhost:3000/'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [ {
          loader: 'angular-hot-loader',
          options: {
            log: false,
            rootElement: 'html'
          }
        }, 'babel-loader', 'ts-loader' ],
        exclude: /node_modules/,
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader'
      },
      {
        test: /\.styl$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'stylus-loader']
        })
      }
    ]
  },
  resolve: {
    modules: ["node_modules"],
    descriptionFiles: ["package.json"],
    extensions: [".tsx", ".ts", ".js", ".styl", ".pug", ".css"]
  },
  devServer: {
    hot: true,
    inline: true,
    port: 3000,
    stats: { chunkModules: false }
  }
};

module.exports = [ Object.assign({
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
    new ExtractTextPlugin('styles.css')
  ]
}, commonConf)
];
