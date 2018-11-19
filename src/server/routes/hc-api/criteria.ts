import { Router } from 'express';
import { ReviewCriterion } from 'server/models';

const criteriaRouter = Router();

/**
 * Gets all review criteria
 */
criteriaRouter.get('/', (req, res, next) => {
  ReviewCriterion.findAll().then((criteria) => {
    res.json({ criteria });
  }).catch(next);
});

export default criteriaRouter;
