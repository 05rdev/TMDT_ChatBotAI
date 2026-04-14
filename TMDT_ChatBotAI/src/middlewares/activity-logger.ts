import { Request, Response, NextFunction } from 'express';
import { ActivityLogService } from '../modules/user/services/activity-log.service';
import { ActivityType } from '@prisma/client';
import { AuthRequest } from './authenticate';

export const activityLogger = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Chúng ta sẽ ghi log sau khi response đã được gửi đi (để có status code chuẩn)
  res.on('finish', () => {
    const userId = req.user?.id;

    const path = req.originalUrl;
    const method = req.method;
    const statusCode = res.statusCode;

    // Chi tiết bổ sung
    const details = `Response Status: ${statusCode}`;

    // Xác định loại hành động dựa trên route (Có thể mở rộng thêm logic)
    let action: ActivityType = ActivityType.SYSTEM;
    
    if (path.includes('/api/auth/login')) action = ActivityType.LOGIN;
    else if (path.includes('/api/auth/register')) action = ActivityType.REGISTER;
    else if (path.includes('/api/auth/logout')) action = ActivityType.LOGOUT;
    else if (path.includes('/api/orders') && method === 'POST') action = ActivityType.CREATE_ORDER;
    else if (method !== 'GET') action = ActivityType.SYSTEM; // Các thay đổi dữ liệu mặc định là SYSTEM nếu chưa phân loại

    // Chỉ log nếu có userId hoặc là các hành động quan trọng (Login/Register)
    if (userId || action === ActivityType.LOGIN || action === ActivityType.REGISTER) {
      ActivityLogService.createLog({
        userId,
        action,
        details,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path,
        method,
      });
    }
  });

  next();
};
