'use strict';

const { series, parallel, src, dest, watch } = require('gulp');
const argv = require('yargs').argv;
const path = require('path');
const del = require('del');
const sequence = require('run-sequence');
const bs = require('browser-sync').create();
const nodemon = require('nodemon');
const webpack = require('webpack-stream');

const autoprefixer = require('autoprefixer');
const concatCss = require('gulp-concat-css');
const gulpIf = require('gulp-if');
const postcss = require('gulp-postcss');
const revAll = require('gulp-rev-all');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const util = require('gulp-util');
const yamlValidate = require('gulp-yaml-validate');

const webpackConfig = require('./webpack.config.js');

let prod = !!argv.prod || process.env.NODE_ENV == 'production';

let assetPath = ['assets/**', '!assets/dist/**', '!assets/styles/**'];
let serverTSPath = ['src/**/*.ts', '!src/js/client/**'];
let clientTSPath = ['src/js/client/index.ts'];
let yamlPath = './src/resources/*.yml';
let cssPath = 'assets/styles/**.css';
let filesToRev = ['.css', '.html', '.icns', '.ico', '.jpg', '.js', '.png', '.svg'];

function onError(err) {
  util.beep();
  console.log(err.message);
  this.emit('end');
  process.exit(1);
}

function clean(cb) {
  return del(['dist', 'assets/dist']);
}

// CSS

function preprocessCSS(cb) {
  return src('assets/styles/all-stylesheets.css')
    .pipe(gulpIf(!prod, sourcemaps.init()))
    .pipe(concatCss('all-stylesheets.css'))
    .pipe(postcss([ autoprefixer() ]))
    .pipe(gulpIf(!prod, sourcemaps.write()))
    .pipe(dest('assets/dist/styles'))
    .on('error', onError)
    .pipe(bs.stream())
}

// YAML

function copyYAML() {
  return src(yamlPath)
    .pipe(yamlValidate({ html: false }))
    .on('error', onError)
    .pipe(dest('dist'));
}

// TS

function pack() {
  webpackConfig['mode'] = prod ? 'production' : 'development';
  return src(clientTSPath)
    .pipe(webpack(webpackConfig))
    .pipe(dest('assets/dist/scripts/'))
    .pipe(bs.stream());
}

function compileServerTS() {
  const tsProject = ts.createProject('tsconfig.json');
  return src(serverTSPath)
    .pipe(tsProject())
    .on('error', onError)
    .js
    .pipe(dest('dist'));
}

// JS

function copyServerJS() {
  const paths = ['src/**/*.js', '!src/js/client/**'];
  return src(paths)
    .pipe(dest('dist'));
}

// Other assets

function copyAssets() {
  return src(assetPath)
    .pipe(dest('assets/dist'))
    .on('error', onError)
    .pipe(bs.stream({ once: true }))
}

function revAssets(cb) {
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

function build() {
  if (prod) {
    return parallel(
      series(
        parallel(copyAssets, preprocessCSS, pack),
        revAssets
      ),
      series(
        parallel(compileServerTS, copyYAML, copyServerJS),
        serve
      )
    )
  } else {
    return parallel(
      parallel(copyAssets, preprocessCSS, pack),
      series(
        parallel(compileServerTS, copyYAML, copyServerJS),
        serve
      )
    )
  }
};

watch(serverTSPath, series(compileServerTS, copyServerJS));
watch(cssPath, preprocessCSS);
watch(['views/**', 'src/resources/**'], bs.reload);
watch(assetPath, copyAssets);
watch(yamlPath, copyYAML);

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

exports.default = series(clean, build());
