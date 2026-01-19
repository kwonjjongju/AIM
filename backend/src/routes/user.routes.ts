import { Router, Response } from 'express';
import { query } from 'express-validator';
import { userService } from '../services/user.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authenticate);

// GET /api/v1/users
router.get(
  '/',
  validate([query('departmentId').optional().isUUID()]),
  async (req: AuthenticatedRequest, res: Response) => {
    const departmentId = req.query.departmentId as string | undefined;
    const users = await userService.getUsers(departmentId);
    res.json({ success: true, data: users });
  }
);

// GET /api/v1/users/me
router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await userService.getUserById(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      const appError = error as { statusCode: number; code: string; message: string };
      res.status(appError.statusCode).json({
        success: false,
        error: { code: appError.code, message: appError.message },
      });
      return;
    }
    throw error;
  }
});

export default router;
