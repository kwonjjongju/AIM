import { Router, Response } from 'express';
import { departmentService } from '../services/department.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authenticate);

// GET /api/v1/departments
router.get('/', async (_req: AuthenticatedRequest, res: Response) => {
  const departments = await departmentService.getDepartments();
  res.json({ success: true, data: departments });
});

export default router;
