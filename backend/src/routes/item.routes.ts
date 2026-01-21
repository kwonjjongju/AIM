import { Router, Response } from 'express';
import { body, query, param } from 'express-validator';
import { itemService } from '../services/item.service.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { AuthenticatedRequest, ItemStatus, UserRole } from '../types/index.js';

const router = Router();

// 모든 라우트에 인증 필요
router.use(authenticate);

// GET /api/v1/items
router.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('departmentId').optional().isUUID(),
    query('status').optional().isIn(Object.values(ItemStatus)),
    query('sort').optional().isIn(['createdAt', 'updatedAt']),
    query('order').optional().isIn(['asc', 'desc']),
    query('staleOnly').optional().isBoolean().toBoolean(),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    const params = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      departmentId: req.query.departmentId as string | undefined,
      status: req.query.status as ItemStatus | undefined,
      sort: (req.query.sort as string) || 'createdAt',
      order: (req.query.order as 'asc' | 'desc') || 'desc',
      staleOnly: req.query.staleOnly === 'true',
    };

    const result = await itemService.getItems(params);
    res.json({ success: true, data: result });
  }
);

// GET /api/v1/items/:id
router.get(
  '/:id',
  validate([param('id').isUUID()]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const item = await itemService.getItemById(req.params.id);
      res.json({ success: true, data: item });
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
  }
);

// POST /api/v1/items (EXECUTIVE 제외)
router.post(
  '/',
  authorize(UserRole.EMPLOYEE, UserRole.DEPT_MANAGER, UserRole.ADMIN),
  validate([
    body('title')
      .notEmpty()
      .withMessage('제목을 입력해주세요')
      .isLength({ max: 100 })
      .withMessage('제목은 100자 이내로 입력해주세요'),
    body('description').optional().isString(),
    body('assignedTo').optional().isUUID(),
    body('relatedDepartments').optional().isArray(),
    body('relatedDepartments.*').optional().isUUID(),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    const item = await itemService.createItem(req.body, req.user!);
    res.status(201).json({ success: true, data: item });
  }
);

// PATCH /api/v1/items/:id
router.patch(
  '/:id',
  authorize(UserRole.EMPLOYEE, UserRole.DEPT_MANAGER, UserRole.ADMIN),
  validate([
    param('id').isUUID(),
    body('title').optional().isLength({ max: 100 }),
    body('description').optional().isString(),
    body('assignedTo').optional().isUUID(),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await itemService.updateItem(req.params.id, req.body, req.user!);
      res.json({ success: true, data: result });
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
  }
);

// PATCH /api/v1/items/:id/status
router.patch(
  '/:id/status',
  authorize(UserRole.EMPLOYEE, UserRole.DEPT_MANAGER, UserRole.ADMIN),
  validate([
    param('id').isUUID(),
    body('status').isIn(Object.values(ItemStatus)).withMessage('올바른 상태값을 입력해주세요'),
    body('note').optional().isString(),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, note } = req.body;
      const result = await itemService.updateStatus(req.params.id, status, note, req.user!);
      res.json({ success: true, data: result });
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
  }
);

// PATCH /api/v1/items/:id/urls
router.patch(
  '/:id/urls',
  authorize(UserRole.EMPLOYEE, UserRole.DEPT_MANAGER, UserRole.ADMIN),
  validate([
    param('id').isUUID(),
    body('gitUrl').optional({ nullable: true }).isString(),
    body('webUrl').optional({ nullable: true }).isString(),
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { gitUrl, webUrl } = req.body;
      const result = await itemService.updateUrls(req.params.id, gitUrl, webUrl, req.user!);
      res.json({ success: true, data: result });
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
  }
);

// DELETE /api/v1/items/:id
router.delete(
  '/:id',
  authorize(UserRole.EMPLOYEE, UserRole.DEPT_MANAGER, UserRole.ADMIN),
  validate([param('id').isUUID()]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await itemService.deleteItem(req.params.id, req.user!);
      res.json({ success: true, data: { message: '삭제되었습니다' } });
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
  }
);

export default router;
