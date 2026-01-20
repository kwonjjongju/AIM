import { Request } from 'express';

// SQLite에서는 enum을 지원하지 않으므로 직접 정의
export const UserRole = {
  EMPLOYEE: 'EMPLOYEE',
  DEPT_MANAGER: 'DEPT_MANAGER',
  EXECUTIVE: 'EXECUTIVE',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const ItemStatus = {
  IDEA: 'IDEA',
  REVIEWING: 'REVIEWING',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  DONE: 'DONE',
} as const;

export type ItemStatus = typeof ItemStatus[keyof typeof ItemStatus];

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  departmentId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Status 관련 유틸리티
export const STATUS_INFO: Record<ItemStatus, { icon: string; label: string; color: string }> = {
  IDEA: { icon: '💡', label: '신규', color: '#FCD34D' },
  REVIEWING: { icon: '👀', label: '검토 중', color: '#60A5FA' },
  IN_PROGRESS: { icon: '🛠️', label: '진행 중', color: '#34D399' },
  ON_HOLD: { icon: '⏸️', label: '미선정', color: '#9CA3AF' },
  DONE: { icon: '✅', label: '완료', color: '#2DD4BF' },
};

export function getStatusInfo(status: ItemStatus) {
  return STATUS_INFO[status];
}

export function calculateDaysSince(date: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
