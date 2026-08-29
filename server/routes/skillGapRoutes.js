import express from 'express';
import { getSkillTaxonomy, getSkillGaps, addSkillGap } from '../controllers/skillGapController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/taxonomy', getSkillTaxonomy);
router.get('/', getSkillGaps);
router.post('/', authorizeRoles('admin', 'training_provider', 'employer'), addSkillGap);

export default router;
