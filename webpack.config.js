const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = [{
  entry: [
    './src/client/index.ts',
    './assets/styles/all-stylesheets.css',
  ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'assets/dist/scripts'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-typescript']
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  }
}, {
  entry: './src/index.ts',
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  target: 'node',
  node: {
    __dirname: false,
  },
  plugins: [
    new webpack.ProvidePlugin({
        _: 'lodash',
    })
  ],
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-typescript']
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.yml$/,
        use: [
          'ejs-loader',
          'yaml-loader',
        ],
      },
    ],
  },
}, {
  entry: glob.sync("./assets/images/**/*"),
  output: {
    path: path.resolve(__dirname, 'assets/dist/images'),
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif|ico)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  }
}];
