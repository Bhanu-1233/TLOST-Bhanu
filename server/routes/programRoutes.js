import express from 'express';
import { getAllPrograms, createProgram, addCohort } from '../controllers/programController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllPrograms);
router.post('/', authorizeRoles('admin', 'training_provider'), createProgram);
router.post('/:id/cohorts', authorizeRoles('admin', 'training_provider'), addCohort);

export default router;
