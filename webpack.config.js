const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const buildPath = 'public';
const contentBase = 'static';

module.exports = (env, argv) => {
  const plugins = [
    new HtmlWebPackPlugin({
      template: './src/index.hbs',
      filename: './index.html',
      title: 'Phaser Learning',
      phaser: argv.mode === 'production'
        ? 'https://cdn.jsdelivr.net/npm/phaser@3.15.1/dist/phaser-arcade-physics.min.js'
        : '',
    }),
    new webpack.DefinePlugin({
      'typeof CANVAS_RENDERER': JSON.stringify(true),
      'typeof WEBGL_RENDERER': JSON.stringify(true),
      'typeof EXPERIMENTAL': JSON.stringify(true),
      'typeof PLUGIN_CAMERA3D': JSON.stringify(false),
      'typeof PLUGIN_FBINSTANT': JSON.stringify(false),
    }),
  ];

  if (argv.mode === 'production') {
    plugins.concat([
      new CopyWebpackPlugin([
        { from: contentBase, to: './', force: true },
      ]),
      new CleanWebpackPlugin([`${buildPath}`]),
    ]);
  }

  const devServer = {
    contentBase,
    historyApiFallback: true,
    compress: true,
    port: 8081,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  };

  return {
    entry: path.resolve(__dirname, 'src/main.js'),
    output: {
      filename: '[name].js',
      chunkFilename: '[id].js',
      path: path.resolve(__dirname, buildPath),
    },
    externals: {
      ...argv.mode === 'production' && {
        phaser: 'Phaser',
      },
    },

    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: [{ loader: 'babel-loader' }],
        },
        {
          test: /\.hbs$/,
          use: [
            {
              loader: 'handlebars-loader',
              options: {
                minimize: argv.mode === 'production',
              },
            },
          ],
        },
      ],
    },

    plugins,

    resolve: {
      modules: [
        path.resolve(__dirname, 'src'),
        'node_modules',
      ],
    },

    devtool: argv.mode === 'production' ? 'source-map' : 'cheap-module-source-map',
    ...argv.mode === 'development' && { devServer },
  };
};
