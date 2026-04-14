import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.helper';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Unauthorized: Missing or invalid token format'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
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
