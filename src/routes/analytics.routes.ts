import { Router } from 'express';
import {
  getAnalytics,
  getProgress,
  getStats,
} from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { apiLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// All analytics routes require authentication
router.use(authMiddleware);

router.get('/', apiLimiter, getAnalytics);
router.get('/progress', apiLimiter, getProgress);
router.get('/stats', apiLimiter, getStats);

export default router;
