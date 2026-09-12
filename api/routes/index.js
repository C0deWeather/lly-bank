import { Router } from 'express';
import healthRouter from './health.js';
import accountsRouter from './accounts.js';
import authRouter from './auth.js';
import adminRouter from './admin.js';
import transfersRouter from './transfers.js';

const router = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use('/accounts', accountsRouter);
router.use('/admin', adminRouter);
router.use('/transfers', transfersRouter);

export default router;
