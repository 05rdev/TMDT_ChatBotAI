import { Response, NextFunction } from 'express';
import { ActivityLogService } from '../modules/user/services/activity-log.service';
import { ActivityType } from '@prisma/client';
import { AuthRequest } from './authenticate';

export const activityLogger = (req: AuthRequest, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    const path = req.originalUrl;
    const method = req.method;
    const statusCode = res.statusCode;
    const details = `Response Status: ${statusCode}`;

    let action: ActivityType = ActivityType.SYSTEM;

    if (path.includes('/api/auth/login')) action = ActivityType.LOGIN;
    else if (path.includes('/api/auth/register')) action = ActivityType.REGISTER;
    else if (path.includes('/api/auth/logout')) action = ActivityType.LOGOUT;
    else if (path.includes('/api/orders') && method === 'POST') action = ActivityType.CREATE_ORDER;

    const shouldLog =
      action === ActivityType.LOGIN ||
      action === ActivityType.REGISTER ||
      action === ActivityType.LOGOUT ||
      method !== 'GET';

    if (!shouldLog) return;

    ActivityLogService.createLog({
      userId: req.user?.id,
      action,
      details,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path,
      method,
    }).catch((error) => {
      console.error('Failed to write activity log:', error);
    });
  });

  next();
};
