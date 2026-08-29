import express from 'express';
import { signup, login, getMe, seedDatabaseEndpoint } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.post('/seed', seedDatabaseEndpoint);

export default router;
