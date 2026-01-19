import prisma from '../config/database.js';

export class DepartmentService {
  async getDepartments() {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        color: true,
      },
    });

    return departments;
  }
}

export const departmentService = new DepartmentService();
