import express from 'express';
import {
  getAllUsers,
  updateUserRoleOrStatus,
  getAuditLogs,
  exportOutcomeData,
} from '../controllers/adminController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id', updateUserRoleOrStatus);
router.get('/audit-logs', getAuditLogs);
router.get('/export-csv', exportOutcomeData);

export default router;
