import * as express from 'express';
import { parse as parseUrl } from 'url';
import * as moment from 'moment';
import { urlencoded as parseUrlEncoded } from 'body-parser';
import { ServeStaticOptions } from 'serve-static';
import * as compression from 'compression';

import { router, apiRouter, applyRouter, eventRouter, hcApiRouter } from './routes';
import { applicationsMiddleware } from 'server/middleware';

import { setUpAuth } from 'server/auth';
import { init as initializeUtils, resolvePath as resolveAssetPath, asset } from 'server/utils';
import { middleware as errorMiddleware } from 'server/errors';

import * as colors from 'shared/colors';
import * as metadata from 'shared/metadata';
import * as dates from 'shared/dates';
import * as theme from 'shared/theme';

const app = express();
let server = require('http').Server(app);

app.set('view engine', 'pug');
// Start server
app.set('port', (process.env.PORT || 3000));

server.listen(app.get('port'), _ => console.log('Node app is running on port', app.get('port')));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at: Promise', promise, 'reason', reason);
});

app.use((req: any, res, next) => {
  res.locals.title = metadata.title;
  res.locals.description = metadata.description;
  res.locals.colors = colors;
  res.locals.event = { dates, theme };
  const port = (app.settings.env == 'development') ? ':' + req.app.settings.port : '';
  const protocol = (app.settings.env == 'development') ? req.protocol : 'https';
  res.locals.requestedUrl = req.requestedUrl = parseUrl(
    protocol + '://' + req.hostname + port + req.originalUrl
  );
  next();
});

initializeUtils(app);

// Static file serving
let staticOptions: ServeStaticOptions = { };
if (app.settings.env != 'development') {
  staticOptions.maxAge = 60 * 60 * 365 * 1000;
}
app.use(compression());
app.use('/assets', express.static('assets/dist', staticOptions));

setUpAuth(app);
app.use(applicationsMiddleware.setAppliedStatus);
app.use(applicationsMiddleware.setApplicationsStatus);

app.locals.asset = asset;
app.locals.moment = moment;

if (process.env.BS_SNIPPET) {
  app.locals.browserSync = process.env.BS_SNIPPET;
}

app.use(parseUrlEncoded({ extended: true }));
app.use('/', router);
app.use('/api', apiRouter);
app.use('/apply', applyRouter);
app.use('/event', eventRouter);
app.use('/hcapi', hcApiRouter);

app.use((req, res) => res.status(404).render('404'));

app.use(errorMiddleware);

export default app;
