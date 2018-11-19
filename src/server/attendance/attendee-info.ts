import { HackerApplication, ApplicationTicket } from 'server/models';

export function getAllApplicationsWithTickets() {
  return HackerApplication.findAll({
    include: [
      {
        model: ApplicationTicket,
        required: true,
      },
    ],
  });
}
