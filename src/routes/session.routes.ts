import { Router } from 'express';
import {
  createSession,
  getSessions,
  getSessionById,
  deleteSession,
} from '../controllers/session.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { sessionCreationLimiter, apiLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// All session routes require authentication
router.use(authMiddleware);

router.post('/', sessionCreationLimiter, createSession);
router.get('/', apiLimiter, getSessions);
router.get('/:id', apiLimiter, getSessionById);
router.delete('/:id', apiLimiter, deleteSession);

export default router;
