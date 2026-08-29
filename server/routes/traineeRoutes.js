import express from 'express';
import {
  getAllTrainees,
  getTraineeById,
  createTrainee,
  updateTrainee,
  recordTrainingCompletion,
  updateConsent,
} from '../controllers/traineeController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', authorizeRoles('admin', 'training_provider', 'employer'), getAllTrainees);
router.get('/:id', getTraineeById);
router.post('/', authorizeRoles('admin', 'training_provider'), createTrainee);
router.put('/:id', updateTrainee);
router.post('/:id/complete', authorizeRoles('admin', 'training_provider'), recordTrainingCompletion);
router.post('/:id/consent', updateConsent);

export default router;
