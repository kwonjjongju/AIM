import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadService } from '../services/upload.service';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// 메모리 스토리지 사용 (파일을 디스크에 저장하지 않음)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.'));
    }
  },
});

// 엑셀 파일 미리보기 (시트 목록 및 데이터 미리보기)
router.post(
  '/preview',
  authenticate,
  authorize('ADMIN', 'DEPT_MANAGER'),
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: '파일이 필요합니다.' });
      }
      
      const result = await uploadService.processExcelFile(
        req.file.buffer,
        req.user!.id,
        { preview: true }
      );
      
      const sheets = await uploadService.getSheetNames(req.file.buffer);
      
      res.json({
        sheets,
        preview: result.preview,
        totalItems: result.preview?.length || 0,
        errors: result.errors,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 엑셀 파일 업로드 및 아이템 생성
router.post(
  '/excel',
  authenticate,
  authorize('ADMIN', 'DEPT_MANAGER'),
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: '파일이 필요합니다.' });
      }
      
      const targetSheets = req.body.sheets 
        ? JSON.parse(req.body.sheets) as string[]
        : undefined;
      
      const result = await uploadService.processExcelFile(
        req.file.buffer,
        req.user!.id,
        { preview: false, targetSheets }
      );
      
      res.json({
        success: true,
        message: `${result.created}개 항목이 등록되었습니다.`,
        created: result.created,
        skipped: result.skipped,
        errors: result.errors,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
