const webpack = require('webpack');
const path = require('path');

const config = {
  entry: './src/Observable/operators.js',
  output: {
    path: path.resolve(__dirname),
    filename: 'operators.js',
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