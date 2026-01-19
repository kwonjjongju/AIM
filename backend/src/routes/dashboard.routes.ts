import { Router, Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authenticate);

// GET /api/v1/dashboard/summary
router.get('/summary', async (_req: AuthenticatedRequest, res: Response) => {
  const summary = await dashboardService.getSummary();
  res.json({ success: true, data: summary });
});

export default router;
