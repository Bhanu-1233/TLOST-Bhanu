import express from 'express';
import { recordOutcome, getOutcomeHistory } from '../controllers/outcomeController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', recordOutcome);
router.get('/history/:traineeId', getOutcomeHistory);

export default router;
