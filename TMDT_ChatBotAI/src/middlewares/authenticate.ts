import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.helper';
import { AppError } from './error.middleware';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Unauthorized: Missing or invalid token format'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    
    // Kiểm tra user có tồn tại và đang hoạt động không
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { isActive: true }
    });

    if (!user) {
      return next(new AppError(401, 'Tài khoản không tồn tại.'));
    }

    if (!user.isActive) {
      return next(new AppError(403, 'Tài khoản của bạn đã bị khóa.'));
    }

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new AppError(401, 'Unauthorized: Token expired'));
    } else {
      next(new AppError(401, 'Unauthorized: Invalid token'));
    }
  }
};

export const optionalAuthenticate = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { isActive: true }
    });

    if (user && user.isActive) {
      req.user = decoded;
    }
  } catch (error) {
    // Bỏ qua lỗi token, coi như là guest
  }
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'Bạn không có quyền thực hiện hành động này'));
    }
    next();
  };
};
