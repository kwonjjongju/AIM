import { Router, Response } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/auth.service.js';
import { validate } from '../middleware/validate.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// POST /api/v1/auth/login
router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('올바른 이메일을 입력해주세요'),
    body('password').notEmpty().withMessage('비밀번호를 입력해주세요'),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      // Refresh token을 HttpOnly cookie로 설정
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      });

      res.json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        const appError = error as { statusCode: number; code: string; message: string };
        res.status(appError.statusCode).json({
          success: false,
          error: {
            code: appError.code,
            message: appError.message,
          },
        });
        return;
      }
      throw error;
    }
  }
);

// POST /api/v1/auth/logout
router.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({
    success: true,
    data: { message: '로그아웃되었습니다' },
  });
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: '리프레시 토큰이 없습니다',
        },
      });
      return;
    }

    const result = await authService.refreshToken(refreshToken);

    // 새 refresh token을 cookie로 설정
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      const appError = error as { statusCode: number; code: string; message: string };
      res.status(appError.statusCode).json({
        success: false,
        error: {
          code: appError.code,
          message: appError.message,
        },
      });
      return;
    }
    throw error;
  }
});

export default router;
