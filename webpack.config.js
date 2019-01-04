const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const buildPath = 'public';
const contentBase = 'static';

module.exports = {
  entry: './src/main.js',
  output: {
    filename: '[name]-[hash].js',
    path: `${__dirname}/${buildPath}`,
  },
  externals: {
    phaser: 'Phaser',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true },
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: contentBase, to: './', force: true },
    ]),
    new CleanWebpackPlugin([`${buildPath}`]),
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
    }),
  ],
  devtool: 'eval-source-map',
  devServer: {
    contentBase,
    historyApiFallback: true,
    compress: true,
    port: 8081,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
};
