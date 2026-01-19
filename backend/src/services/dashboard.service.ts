import prisma from '../config/database.js';
import { calculateDaysSince, ItemStatus } from '../types/index.js';

export class DashboardService {
  async getSummary() {
    // 전체 건수
    const total = await prisma.improvementItem.count({
      where: { isDeleted: false },
    });

    // 상태별 건수
    const statusCounts = await prisma.improvementItem.groupBy({
      by: ['status'],
      where: { isDeleted: false },
      _count: { id: true },
    });

    const byStatus: Record<ItemStatus, number> = {
      IDEA: 0,
      REVIEWING: 0,
      IN_PROGRESS: 0,
      ON_HOLD: 0,
      DONE: 0,
    };

    statusCounts.forEach((sc) => {
      byStatus[sc.status] = sc._count.id;
    });

    // 부서별 건수 (부서 코드순 정렬)
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
      include: {
        _count: {
          select: {
            items: {
              where: { isDeleted: false },
            },
          },
        },
      },
    });

    const byDepartment = departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      color: dept.color,
      count: dept._count.items,
    }));

    // 오래된 항목 (30일+ 업데이트 안된 항목, 최대 5개)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const staleItemsRaw = await prisma.improvementItem.findMany({
      where: {
        isDeleted: false,
        updatedAt: { lt: thirtyDaysAgo },
        status: { not: ItemStatus.DONE }, // 완료된 항목은 제외
      },
      orderBy: { updatedAt: 'asc' },
      take: 5,
      include: {
        department: { select: { name: true } },
      },
    });

    const staleItems = staleItemsRaw.map((item) => ({
      id: item.id,
      title: item.title,
      daysSinceUpdate: calculateDaysSince(item.updatedAt),
      department: { name: item.department.name },
    }));

    return {
      total,
      byStatus,
      byDepartment,
      staleItems,
    };
  }
}

export const dashboardService = new DashboardService();
