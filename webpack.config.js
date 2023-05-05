/* -*- indent-tabs-mode: nil; tab-width: 2; -*- */
/* vim: set ts=2 sw=2 et ai : */
/**
  Container Tab Groups
  Copyright (C) 2023 Menhera.org

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
  @license
**/

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env es2020, node */

const path = require('path');

const DeadCodePlugin = require('webpack-deadcode-plugin');

const CopyPlugin = require("copy-webpack-plugin");

const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  context: __dirname,
  target: ['web', 'es2021'],
  devtool: 'source-map',

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },

  node: {
    __filename: true,
    __dirname: true,
  },

  entry: {
    'background': {
      import: './src/pages/background/background.ts',
      filename: 'background/background.js',
    },
    'index': {
      import: './src/pages/index/index-tab.ts',
      filename: 'pages/index/index-tab.js',
    },
    'navigation': {
      import: './src/pages/navigation/select-container.tsx',
      filename: 'pages/navigation/confirm.js',
    },
    'options': {
      import: './src/pages/options/options.ts',
      filename: 'pages/options/options.js',
    },
    'panorama': {
      import: './src/pages/panorama/panorama.ts',
      filename: 'pages/panorama/panorama.js',
    },
    'cookies': {
      import: './src/pages/cookies/cookies.ts',
      filename: 'pages/cookies/cookies.js',
    },
    'content': {
      import: './src/content/content.ts',
      filename: 'content/content.js',
    },
    'pageAction': {
      import: './src/pages/page-action/page-action.ts',
      filename: 'pages/page-action/page-action.js',
    },
    'popup': {
      import: './src/pages/popup-v2/popup-v2.ts',
      filename: 'pages/popup-v2/popup-v2.js',
    },
    'debugging': {
      import: './src/pages/debugging/debugging.ts',
      filename: 'pages/debugging/debugging.js',
    },
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    library: ['CTG', '[name]'],
  },

  module: {
    rules: [
      {
        test: /\.(js|tsx?)$/,
        use: 'ts-loader',
      },
    ],
  },

  optimization: {
    moduleIds: 'deterministic',
    minimizer: [
      new TerserPlugin({
        exclude: [
          /react/,
        ],
      }),
    ],
  },

  plugins: [
    new DeadCodePlugin({
      patterns: [
        'src/**/*.(js|ts|tsx)',
      ],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "react/react*.js",
          to: "./",
        },
      ],
    }),
  ],
};
