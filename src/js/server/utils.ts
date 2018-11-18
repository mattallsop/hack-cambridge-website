import * as crypto from 'crypto';
import { Express } from 'express';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import * as path from 'path';
import { render as renderEjs } from 'ejs'; 

import * as dates from 'js/shared/dates';
import * as theme from 'js/shared/theme';

const loadedResources = {};
let app: Express;

const PROJECT_ROOT = path.resolve(path.join(__dirname, '..'));

function timeProperties(items, properties) {
  items.forEach((item) => properties.forEach((prop) => item[prop] = moment.tz(item[prop], 'Europe/London')));
}

export function init(a) {
  app = a;
}

export function resolvePath(fromProjectRoot) {
  return path.join(PROJECT_ROOT, fromProjectRoot);
}

let assetsFile = {};

try {
  assetsFile = require(resolvePath('assets/dist/rev-manifest.json'));
} catch (e) {
  assetsFile = { };
}

export function asset(asset, prefix) {
  if (prefix == null) {
    prefix = '/assets/';
  }

  if (_.has(assetsFile, asset)) {
    asset = assetsFile[asset];
  }

  return prefix + asset;
};

function loadScheduleTimeProperties(loadedScheduleResource) {
  loadedScheduleResource.forEach(day => {
    timeProperties(day.entries, ['time']);
    day.entries.forEach(entry => {
      entry.events.forEach(event => {
        if (event.subevents) {
          timeProperties(event.subevents, ['time']);
        }
      });
    });
  });
}

export function loadResource(resourceName) {
  if ((!loadedResources[resourceName]) || app === undefined || app.settings.env === 'development') {
    let loadedResource = yaml.safeLoad(
      renderEjs(
        fs.readFileSync(resolvePath(`dist/${require(`resources/${resourceName}.yml`)}`)).toString(),
        { dates: dates, theme: theme }
      )
    )[resourceName];
    switch (resourceName) {
      case 'workshops':
      case 'api_demos':
        timeProperties(loadedResource, ['time']);

        loadedResource = loadedResource.sort((r1, r2) => {
          let time1 = r1.time;
          let time2 = r2.time;

          if (time1.isValid()) {
            if (!time2.isValid()) {
              return -1;
            } else {
              return Math.sign(time1.diff(time2));
            }
          } else {
            return (time2.isValid()) ? 1 : 0;
          }
        });
        break;
      case 'schedule':
        loadScheduleTimeProperties(loadedResource);
        break;
      case 'dashboard':
      case 'faqs':
    }

    loadedResources[resourceName] = loadedResource;
  }

  return loadedResources[resourceName];
};

let publicId = crypto.randomBytes(12).toString('hex');

export function getPublicId() {
  return publicId;
}

export class ErrorWithStatus extends Error {
  constructor(name: string, public status: number) {
    super(name);
  }
}
