import prisma from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';

export class UserService {
  async getUsers(departmentId?: string) {
    const where: Record<string, unknown> = { isActive: true };
    if (departmentId) {
      where.departmentId = departmentId;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
      },
    });

    return users;
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'NOT_FOUND', '사용자를 찾을 수 없습니다');
    }

    return user;
  }
}

export const userService = new UserService();
