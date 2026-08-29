import express from 'express';
import {
  createValidationRequest,
  getValidationByToken,
  submitValidation,
  getValidationRequests,
} from '../controllers/validationController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public token-based verification endpoints (Privacy-conscious, low friction)
router.get('/token/:token', getValidationByToken);
router.post('/token/:token/submit', submitValidation);

// Authenticated endpoints for provider/employer dashboards
router.post('/request', verifyToken, authorizeRoles('admin', 'training_provider'), createValidationRequest);
router.get('/', verifyToken, authorizeRoles('admin', 'training_provider', 'employer'), getValidationRequests);

export default router;
