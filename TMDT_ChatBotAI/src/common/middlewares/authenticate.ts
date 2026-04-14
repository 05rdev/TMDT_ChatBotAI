import { Request, Response, NextFunction } from 'express';
import { JWTHelper } from '../utils/jwt.helper';
import { AppError } from '../utils/app-error';

// Mở rộng Request type của Express để thêm user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = JWTHelper.verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token đã hết hạn.', 401));
    }
    next(new AppError('Token không hợp lệ.', 401));
  }
};
