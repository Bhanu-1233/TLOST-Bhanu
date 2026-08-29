import express from 'express';
import {
  getMyFollowUps,
  getAllFollowUps,
  submitFollowUpResponse,
} from '../controllers/followUpController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/my', authorizeRoles('trainee'), getMyFollowUps);
router.get('/', authorizeRoles('admin', 'training_provider'), getAllFollowUps);
router.post('/:id/respond', submitFollowUpResponse);

export default router;
