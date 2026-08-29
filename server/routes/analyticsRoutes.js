import express from 'express';
import { getOverviewAnalytics } from '../controllers/analyticsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/overview', getOverviewAnalytics);

export default router;
