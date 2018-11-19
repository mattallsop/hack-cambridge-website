import { Router } from 'express';
import { getTicketsWithApplicantInfo } from 'server/attendance/logic';

const ticketsRouter = Router();

/**
 * Gets all tickets with applicant info
 */
ticketsRouter.get('/', (req, res, next) => {
  getTicketsWithApplicantInfo()
    .then((tickets) => {
      res.json(tickets);
    }).catch(next);
});

export default ticketsRouter;
