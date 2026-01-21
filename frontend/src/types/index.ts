// 상태 타입
export type ItemStatus = 'IDEA' | 'REVIEWING' | 'IN_PROGRESS' | 'ON_HOLD' | 'DONE';

// 역할 타입
export type UserRole = 'EMPLOYEE' | 'DEPT_MANAGER' | 'EXECUTIVE' | 'ADMIN';

// 부서
export interface Department {
  id: string;
  name: string;
  code: string;
  color: string;
}

// 사용자
export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: Department;
  role: UserRole;
}

// 개선 항목
export interface ImprovementItem {
  id: string;
  title: string;
  description?: string;
  status: ItemStatus;
  statusIcon: string;
  statusLabel: string;
  department: {
    id: string;
    name: string;
    color: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  } | null;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
  daysSinceUpdate: number;
}

// 항목 상세
export interface ImprovementItemDetail extends ImprovementItem {
  relatedDepartments: Department[];
  attachments: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  }[];
  statusHistory: {
    fromStatus: ItemStatus | null;
    toStatus: ItemStatus;
    changedBy: { id: string; name: string };
    note: string | null;
    changedAt: string;
  }[];
}

// 대시보드 요약
export interface DashboardSummary {
  total: number;
  byStatus: Record<ItemStatus, number>;
  byDepartment: {
    id: string;
    name: string;
    color: string;
    count: number;
  }[];
  staleItems: {
    id: string;
    title: string;
    daysSinceUpdate: number;
    department: { name: string };
  }[];
}

// 페이지네이션
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API 응답
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

// 상태 정보
export const STATUS_CONFIG: Record<ItemStatus, { icon: string; label: string; color: string; bgClass: string }> = {
  IDEA: { icon: '💡', label: '신규', color: '#FCD34D', bgClass: 'bg-status-idea' },
  REVIEWING: { icon: '👀', label: '검토 중', color: '#A855F7', bgClass: 'bg-status-reviewing' },
  IN_PROGRESS: { icon: '🛠️', label: '진행 중', color: '#60A5FA', bgClass: 'bg-status-progress' },
  ON_HOLD: { icon: '⏸️', label: '미선정', color: '#9CA3AF', bgClass: 'bg-status-hold' },
  DONE: { icon: '✅', label: '완료', color: '#2DD4BF', bgClass: 'bg-status-done' },
};
