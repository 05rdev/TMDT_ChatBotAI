import { Request, Response, NextFunction } from 'express';
import { MaintenanceHelper } from '../utils/maintenance.helper';
import { verifyAccessToken } from '../utils/jwt.helper';

export const maintenanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // If maintenance mode is not enabled, proceed
  if (!MaintenanceHelper.isEnabled()) {
    return next();
  }

  // Bypass maintenance mode for:
  // 1. Auth routes (so admin can log in)
  // 2. Admin routes
  // 3. Health check or documentation
  const path = req.path;
  if (
    path.startsWith('/api/auth') ||
    path.startsWith('/api/admin') ||
    path === '/health' ||
    path.startsWith('/api/docs') ||
    path === '/'
  ) {
    return next();
  }

  // Also bypass if the request has a valid Admin JWT token
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      if (decoded && decoded.role === 'ADMIN') {
        return next();
      }
    } catch (e) {
      // Ignore token verification errors, proceed to block
    }
  }

  // Block the request with 503 Service Unavailable
  res.status(503).json({
    success: false,
    message: 'Hệ thống đang bảo trì. Vui lòng quay lại sau.',
    maintenance: true,
  });
};
