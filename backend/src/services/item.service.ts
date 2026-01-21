import prisma from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { getStatusInfo, calculateDaysSince, JwtPayload, ItemStatus, UserRole } from '../types/index.js';

interface GetItemsParams {
  page: number;
  limit: number;
  departmentId?: string;
  status?: ItemStatus;
  sort?: string;
  order?: 'asc' | 'desc';
  staleOnly?: boolean;
}

interface CreateItemData {
  title: string;
  description?: string;
  assignedTo?: string;
  relatedDepartments?: string[];
}

interface UpdateItemData {
  title?: string;
  description?: string;
  assignedTo?: string;
  gitUrl?: string;
  webUrl?: string;
}

export class ItemService {
  async getItems(params: GetItemsParams) {
    const { page, limit, departmentId, status, sort = 'createdAt', order = 'desc', staleOnly } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      isDeleted: false,
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.status = status;
    }

    if (staleOnly) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.updatedAt = { lt: thirtyDaysAgo };
    }

    const [items, total] = await Promise.all([
      prisma.improvementItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          department: true,
          creator: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true } },
          _count: { select: { attachments: true } },
        },
      }),
      prisma.improvementItem.count({ where }),
    ]);

    return {
      items: items.map((item) => {
        const statusInfo = getStatusInfo(item.status);
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          status: item.status,
          statusIcon: statusInfo.icon,
          statusLabel: statusInfo.label,
          department: {
            id: item.department.id,
            name: item.department.name,
            color: item.department.color,
          },
          createdBy: item.creator,
          assignedTo: item.assignee,
          attachmentCount: item._count.attachments,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          daysSinceUpdate: calculateDaysSince(item.updatedAt),
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getItemById(id: string) {
    const item = await prisma.improvementItem.findFirst({
      where: { id, isDeleted: false },
      include: {
        department: true,
        creator: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            uploadedAt: true,
          },
        },
        statusHistories: {
          orderBy: { changedAt: 'desc' },
          include: {
            changer: { select: { id: true, name: true } },
          },
        },
        relatedDepartments: {
          include: {
            department: { select: { id: true, name: true, color: true } },
          },
        },
      },
    });

    if (!item) {
      throw new AppError(404, 'NOT_FOUND', '항목을 찾을 수 없습니다');
    }

    const statusInfo = getStatusInfo(item.status);

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      gitUrl: item.gitUrl,
      webUrl: item.webUrl,
      status: item.status,
      statusIcon: statusInfo.icon,
      statusLabel: statusInfo.label,
      department: {
        id: item.department.id,
        name: item.department.name,
        code: item.department.code,
        color: item.department.color,
      },
      createdBy: item.creator,
      assignedTo: item.assignee,
      relatedDepartments: item.relatedDepartments.map((rd) => rd.department),
      attachments: item.attachments,
      statusHistory: item.statusHistories.map((h) => ({
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        changedBy: h.changer,
        note: h.note,
        changedAt: h.changedAt,
      })),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async createItem(data: CreateItemData, user: JwtPayload) {
    const item = await prisma.improvementItem.create({
      data: {
        title: data.title,
        description: data.description,
        departmentId: user.departmentId,
        createdBy: user.userId,
        assignedTo: data.assignedTo,
        statusHistories: {
          create: {
            toStatus: ItemStatus.IDEA,
            changedBy: user.userId,
          },
        },
        ...(data.relatedDepartments && {
          relatedDepartments: {
            create: data.relatedDepartments.map((deptId) => ({
              departmentId: deptId,
            })),
          },
        }),
      },
    });

    return {
      id: item.id,
      title: item.title,
      status: item.status,
      createdAt: item.createdAt,
    };
  }

  async updateItem(id: string, data: UpdateItemData, user: JwtPayload) {
    const item = await prisma.improvementItem.findFirst({
      where: { id, isDeleted: false },
    });

    if (!item) {
      throw new AppError(404, 'NOT_FOUND', '항목을 찾을 수 없습니다');
    }

    // 권한 체크
    this.checkPermission(item, user);

    const updated = await prisma.improvementItem.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo,
        gitUrl: data.gitUrl,
        webUrl: data.webUrl,
      },
    });

    return {
      id: updated.id,
      title: updated.title,
      gitUrl: updated.gitUrl,
      webUrl: updated.webUrl,
      updatedAt: updated.updatedAt,
    };
  }

  async updateStatus(id: string, status: ItemStatus, note: string | undefined, user: JwtPayload) {
    const item = await prisma.improvementItem.findFirst({
      where: { id, isDeleted: false },
    });

    if (!item) {
      throw new AppError(404, 'NOT_FOUND', '항목을 찾을 수 없습니다');
    }

    // 권한 체크
    this.checkPermission(item, user);

    const [updated] = await prisma.$transaction([
      prisma.improvementItem.update({
        where: { id },
        data: { status },
      }),
      prisma.statusHistory.create({
        data: {
          itemId: id,
          fromStatus: item.status,
          toStatus: status,
          changedBy: user.userId,
          note,
        },
      }),
    ]);

    const statusInfo = getStatusInfo(status);

    return {
      id: updated.id,
      status: updated.status,
      statusIcon: statusInfo.icon,
      statusLabel: statusInfo.label,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteItem(id: string, user: JwtPayload) {
    const item = await prisma.improvementItem.findFirst({
      where: { id, isDeleted: false },
    });

    if (!item) {
      throw new AppError(404, 'NOT_FOUND', '항목을 찾을 수 없습니다');
    }

    // 권한 체크
    this.checkPermission(item, user);

    await prisma.improvementItem.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async updateUrls(id: string, gitUrl: string | undefined, webUrl: string | undefined, user: JwtPayload) {
    const item = await prisma.improvementItem.findFirst({
      where: { id, isDeleted: false },
    });

    if (!item) {
      throw new AppError(404, 'NOT_FOUND', '항목을 찾을 수 없습니다');
    }

    // 권한 체크
    this.checkPermission(item, user);

    const updated = await prisma.improvementItem.update({
      where: { id },
      data: {
        gitUrl: gitUrl ?? null,
        webUrl: webUrl ?? null,
      },
    });

    return {
      id: updated.id,
      gitUrl: updated.gitUrl,
      webUrl: updated.webUrl,
      updatedAt: updated.updatedAt,
    };
  }

  private checkPermission(item: { createdBy: string; departmentId: string }, user: JwtPayload) {
    // ADMIN은 모든 권한
    if (user.role === UserRole.ADMIN) {
      return;
    }

    // EXECUTIVE는 수정/삭제 불가
    if (user.role === UserRole.EXECUTIVE) {
      throw new AppError(403, 'FORBIDDEN', '권한이 없습니다');
    }

    // DEPT_MANAGER는 부서 내 항목만
    if (user.role === UserRole.DEPT_MANAGER) {
      if (item.departmentId !== user.departmentId) {
        throw new AppError(403, 'FORBIDDEN', '부서 내 항목만 수정할 수 있습니다');
      }
      return;
    }

    // EMPLOYEE는 본인 항목만
    if (item.createdBy !== user.userId) {
      throw new AppError(403, 'FORBIDDEN', '본인이 등록한 항목만 수정할 수 있습니다');
    }
  }
}

export const itemService = new ItemService();
