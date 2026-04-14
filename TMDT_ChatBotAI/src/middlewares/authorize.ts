import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { AppError } from './error.middleware';
import { Role } from '@prisma/client';

export const authorize = (roles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'Unauthorized: User not found in request'));
    }

    if (!roles.includes(req.user.role as Role)) {
      return next(new AppError(403, 'Forbidden: You do not have permission'));
    }

    next();
  };
};
