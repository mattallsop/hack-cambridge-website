const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = [
  {
    name: 'clientside',
    entry: './src/client/index.ts',
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
    },
    plugins: [
      new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]),
    ],
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist/assets/scripts'),
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-typescript'],
              },
            },
            'ts-loader',
          ],
          exclude: /node_modules/,
        },
      ],
    },
  }, {
    name: 'serverside',
    entry: './src/index.ts',
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
      modules: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'views'),
        path.resolve(__dirname, 'assets'),
        'node_modules',
      ],
    },
    plugins: [
      new CleanWebpackPlugin(['dist'], { verbose: false }),
      new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]),
    ],
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
    },
    target: 'node',
    node: {
      __dirname: false,
    },
    devServer: {
      contentBase: path.join(__dirname, 'public'),
    },
    externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-typescript'],
              },
            },
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.(png|jpg|gif|ico|svg)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[hash].[ext]',
              outputPath: 'assets',
              publicPath: '/assets',
            },
          },
        },
        {
          test: /\.yml$/,
          use: [
            'ejs-compiled-loader',
            'yaml-loader',
          ],
        },
        {
          test: /\.pug$/,
          use: [
            'pug-loader',
          ],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[hash].[ext]',
                outputPath: 'assets',
                publicPath: '/assets',
              },
            },
            'extract-loader',
            'css-loader',
          ],
        },
      ],
    },
  },
]
