import { Router, Response } from 'express';
import { aiToolUserService } from '../services/aiToolUser.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authenticate);

// GET /api/v1/ai-tool-users - 전체 조회
router.get('/', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await aiToolUserService.getAll();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('AI Tool Users fetch error:', error);
    res.status(500).json({ success: false, message: '데이터 조회 실패' });
  }
});

// POST /api/v1/ai-tool-users - 전체 저장
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { users } = req.body;
    const savedUsers = await aiToolUserService.saveAll(users);
    res.json({ success: true, data: savedUsers, message: '저장되었습니다' });
  } catch (error) {
    console.error('AI Tool Users save error:', error);
    res.status(500).json({ success: false, message: '저장 실패' });
  }
});

export default router;
