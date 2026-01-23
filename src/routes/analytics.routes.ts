import { Router } from 'express';
import {
  getAnalytics,
  getProgress,
  getStats,
} from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All analytics routes require authentication
router.use(authMiddleware);

router.get('/', getAnalytics);
router.get('/progress', getProgress);
router.get('/stats', getStats);

export default router;
