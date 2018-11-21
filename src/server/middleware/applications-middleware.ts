import { Request, Response, NextFunction } from 'express';

import { HackerApplicationInstance } from 'server/models';
import * as statuses from 'shared/status-constants';

/**
 * Intercepts the request to check if the user has submitted an application
 * 
 * If they have, it will redirect them to the previous page. Otherwise, it will let them proceed
 * as normal.
 */
 
export function goBackIfApplied(req: Request, res: Response, next: NextFunction) {
  alreadyApplied(req, res, next).then((applied: boolean) => {
    applied === true ? res.redirect('back') : next();
  }).catch(next);
}

/**
 * Intercepts requests to check if applications are still open, redirecting to the previous page
 * if not
 */

export function goBackIfApplicationsClosed(req: Request, res: Response, next: NextFunction) {
  applicationsClosed(req, res, next).then((closed: boolean) => {
    closed === true ? res.redirect('back') : next();
  }).catch(next); 
}

export function setAppliedStatus(req: Request, res: Response, next: NextFunction) {
  alreadyApplied(req, res, next).then((applied: boolean) => {
    res.locals.applied = applied;
    next();
  }).catch(next); 
}

export function setApplicationsStatus(req: Request, res: Response, next: NextFunction) {
  applicationsClosed(req, res, next).then((closed: boolean) => {
    res.locals.applicationsOpen = !closed;
    next();
  }).catch(next); 
}

export async function applicationsClosed(req: Request, res: Response, next: NextFunction) {
  if (process.env.APPLICATIONS_OPEN_STATUS === statuses.applicationsOpen.CLOSED) {
    return true
  } else return false;
}

export async function alreadyApplied(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    return await req.user.getHackerApplication().then((hackerApplication: HackerApplicationInstance) => {
      if (hackerApplication) return true;
    }).catch(next);
  } else return false;
}
