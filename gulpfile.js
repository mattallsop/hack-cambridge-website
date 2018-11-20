'use strict';

const { series, parallel, dest, watch } = require('gulp');
const argv = require('yargs').argv;
const path = require('path');
const bs = require('browser-sync').create();
const nodemon = require('nodemon');
const webpack = require('webpack-stream');
const beeper = require('beeper');

const webpackConfig = require('./webpack.config.js');

let prod = !!argv.prod || process.env.NODE_ENV == 'production';

let viewsPath = 'views/**';

function onError(err) {
  beeper();
  console.log(err.message);
  this.emit('end');
  process.exit(1);
}

// TS

async function packClientSide(cb) {
  webpackConfig[0]['mode'] = prod ? 'production' : 'development';
  webpackConfig[0]['watch'] = prod ? 'false' : 'true';
  return webpack(webpackConfig[0])
    .pipe(dest('dist/assets/scripts/'))
    .pipe(bs.stream());
}

async function packServerSide(cb) {
  webpackConfig[1]['mode'] = prod ? 'production' : 'development';
  webpackConfig[1]['watch'] = prod ? 'false' : 'true';
  return webpack(webpackConfig[1])
    .pipe(dest('dist'))
    .pipe(bs.stream());
}

const build = parallel(packServerSide, packClientSide);

watch(viewsPath, bs.reload);

function serve(cb) {
  let runnode = function (env = {}) {
    nodemon({
      script: 'dist/index.js',
      ext: 'js',
      ignore: ['dist/js/client/**', 'gulpfile.js'],
      env: Object.assign({
        NODE_PATH: './dist',
      }, env),
    });
  };
  if (!argv.nobs) {
    bs.init({
      port: 8000,
      logSnippet: false
    }, (err) => {
      runnode({
        BS_SNIPPET: bs.getOption('snippet')
      });
    });
  } else {
    runnode({
      NODE_PATH: `${process.env.NODE_PATH}:./src`,
    });
  }
  cb();
}

exports.build = build;
exports.serve = series(build, serve);
exports.default = series(build, serve);
