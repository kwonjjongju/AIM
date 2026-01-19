import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { jwtConfig } from '../config/jwt.js';
import { JwtPayload } from '../types/index.js';
import { AppError } from '../middleware/error.middleware.js';

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        department: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError(401, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    };

    const accessToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        department: {
          id: user.department.id,
          name: user.department.name,
          code: user.department.code,
          color: user.department.color,
        },
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as JwtPayload;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { department: true },
      });

      if (!user || !user.isActive) {
        throw new AppError(401, 'INVALID_TOKEN', '유효하지 않은 토큰입니다');
      }

      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
      };

      const newAccessToken = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
      });

      const newRefreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
        expiresIn: jwtConfig.refreshExpiresIn,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          employeeId: user.employeeId,
          department: {
            id: user.department.id,
            name: user.department.name,
            code: user.department.code,
            color: user.department.color,
          },
          role: user.role,
        },
      };
    } catch (error) {
      throw new AppError(401, 'INVALID_TOKEN', '유효하지 않은 토큰입니다');
    }
  }
}

export const authService = new AuthService();
