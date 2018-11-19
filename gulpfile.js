'use strict';

const { series, parallel, src, dest, watch } = require('gulp');
const argv = require('yargs').argv;
const path = require('path');
const del = require('del');
const sequence = require('run-sequence');
const bs = require('browser-sync').create();
const nodemon = require('nodemon');
const webpack = require('webpack-stream');

const gulpIf = require('gulp-if');
const revAll = require('gulp-rev-all');
const util = require('gulp-util');

const webpackConfig = require('./webpack.config.js');

let prod = !!argv.prod || process.env.NODE_ENV == 'production';

let assetPath = ['assets/**', '!assets/dist/**', '!assets/styles/**'];
let viewsPath = 'views/**';
let filesToRev = ['.css', '.html', '.icns', '.ico', '.jpg', '.js', '.png', '.svg'];

function onError(err) {
  util.beep();
  console.log(err.message);
  this.emit('end');
  process.exit(1);
}

function clean() {
  return del(['dist', 'assets/dist']);
}

// TS

function packClientSide() {
  webpackConfig[0]['mode'] = prod ? 'production' : 'development';
  return webpack(webpackConfig[0])
    .pipe(dest('assets/dist/scripts/'))
    .pipe(bs.stream());
}

function packServerSide() {
  webpackConfig[1]['mode'] = prod ? 'production' : 'development';
  return webpack(webpackConfig[1])
    .pipe(dest('dist'))
    .pipe(bs.stream());
}

// Other assets

function copyAssets() {
  return src(assetPath)
    .pipe(dest('assets/dist'))
    .on('error', onError)
    .pipe(bs.stream({ once: true }));
}

function revAssets() {
  setTimeout(_ => {
    return src('assets/dist/**')
      .pipe(revAll.revision({
        includeFilesInManifest: filesToRev
      }))
      .pipe(dest('assets/dist'))
      .pipe(revAll.manifestFile())
      .on('error', onError)
      .pipe(dest('assets/dist'))
  }, 2000)
}

const buildClientSide = parallel(copyAssets, packClientSide);

const build = parallel(packServerSide, buildClientSide);

const buildAndServe = (_ => {
  if (prod) {
    return parallel(
      series(buildClientSide, revAssets),
      series(packServerSide, serve)
    )
  } else {
    return parallel(
      buildClientSide,
      series(packServerSide, serve)
    )
  }
})();

watch(viewsPath, bs.reload);
watch(assetPath, copyAssets);

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

exports.build = series(clean, build);
exports.serve = series(clean, buildAndServe);
exports.default = series(clean, buildAndServe);
