const webpack = require('webpack');
const path = require('path');

const config = {
  entry: './src/Observable/schedulers.js',
  output: {
    path: path.resolve(__dirname),
    filename: 'schedulers.js',
    libraryTarget: 'commonjs2'
  },
  experiments: {
    outputModule: true,
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
};

module.exports = config;