var glob = require('glob');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var commonConf = {
  cache: true,
  watch: true,
  devtool: 'cheap-module-eval-source-map',
  context: __dirname,
  output: {
    filename: '[name]-bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [ {
          loader: 'babel-loader',
          query: {
            cacheDirectory: true,
            presets: ['env'],
            plugins: ['angularjs-annotate','transform-runtime']
          }
        }, 'ts-loader' ],
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
      },

      { test: /\.svg$/, loader: 'url-loader?limit=65000&mimetype=image/svg+xml&name=public/fonts/[name].[ext]' },
      { test: /\.woff$/, loader: 'url-loader?limit=65000&mimetype=application/font-woff&name=public/fonts/[name].[ext]' },
      { test: /\.woff2$/, loader: 'url-loader?limit=65000&mimetype=application/font-woff2&name=public/fonts/[name].[ext]' },
      { test: /\.[ot]tf$/, loader: 'url-loader?limit=65000&mimetype=application/octet-stream&name=public/fonts/[name].[ext]' },
      { test: /\.eot$/, loader: 'url-loader?limit=65000&mimetype=application/vnd.ms-fontobject&name=public/fonts/[name].[ext]' }
    ]
  },
  resolve: {
    modules: [__dirname+'/app', 'node_modules'],
    descriptionFiles: ['package.json'],
    extensions: ['.tsx', '.ts', '.js', '.styl', '.pug', '.css']
  },
  externals: {
    angular: 'angular',
    'plotly.js': 'Plotly',
    d3: 'd3'
  },
  devServer: {
    hot: true,
    inline: true,
    port: 3000,
    stats: { chunkModules: false }
  }
};

module.exports = commonConf
