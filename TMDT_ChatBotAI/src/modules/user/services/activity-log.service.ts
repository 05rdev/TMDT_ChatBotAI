import { prisma } from '../../../common/utils/prisma.service';
import { ActivityType } from '@prisma/client';

export interface CreateLogData {
  userId?: string;
  action: ActivityType;
  details?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
}

export class ActivityLogService {
  /**
   * Ghi log hoạt động của người dùng
   */
  static async createLog(data: CreateLogData) {
    try {
      await prisma.activityLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          details: data.details,
          ip: data.ip,
          userAgent: data.userAgent,
          path: data.path,
          method: data.method,
        },
      });
    } catch (error) {
      // Chúng ta không throw lỗi ở đây để tránh làm chết request chính của người dùng
      console.error('❌ Failed to create activity log:', error);
    }
  }

  /**
   * Lấy danh sách logs cho Admin (có phân trang)
   */
  static async getLogs(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.activityLog.count()
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
