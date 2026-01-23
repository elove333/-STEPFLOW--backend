import { Router } from 'express';
import {
  createSession,
  getSessions,
  getSessionById,
  deleteSession,
} from '../controllers/session.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All session routes require authentication
router.use(authMiddleware);

router.post('/', createSession);
router.get('/', getSessions);
router.get('/:id', getSessionById);
router.delete('/:id', deleteSession);

export default router;
