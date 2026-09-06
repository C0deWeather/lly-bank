import { Router } from 'express';
import healthRouter from './health.js';
import accountsRouter from './accounts.js';

const router = Router();

router.use(healthRouter);
router.use('/accounts', accountsRouter);

export default router;
