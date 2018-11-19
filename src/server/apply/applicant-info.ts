import { Hacker } from 'server/models';
import * as statuses from 'shared/status-constants';
import { getApplicationStatus, getTeamApplicationStatus } from 'server/models/Hacker';

export const unfinishedApplicationKind = { INDIVIDUAL: 'individual', TEAM_ONLY: 'team-only' };

export function getHackersWithUnfinishedApplications(kind) {
  return Hacker.findAll().then(hackers =>
    Promise.all(hackers.map(hacker =>
      hacker.getHackerApplication().then(hackerApplication =>
        Promise.all([getApplicationStatus(),getTeamApplicationStatus()])
          .then(([applicationStatus, teamApplicationStatus]) => {
            if (kind == unfinishedApplicationKind.INDIVIDUAL) {
              return applicationStatus == statuses.application.INCOMPLETE ? hacker : null;
            } else if (kind == unfinishedApplicationKind.TEAM_ONLY) {
              // The value of teamApplicationStatus is null if the individual application hasn't been finished,
              // so ensure we only return the hacker when teamApplicationStatus is INCOMPLETE.
              return teamApplicationStatus == statuses.teamApplication.INCOMPLETE ? hacker : null;
            } else {
              throw Error('Unknown unfinished application kind');
            }
          })
        )
      )).then(hackerResults => hackerResults.filter(result => result !== null))
  );
}
