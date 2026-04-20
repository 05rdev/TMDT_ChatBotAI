import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../middlewares/error.middleware';

export class NotificationService {
  async getMyNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where: { userId } })
    ]);

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new AppError(404, 'Thông báo không tồn tại');
    if (notification.userId !== userId) throw new AppError(403, 'Không có quyền truy cập');

    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }

  // Phương thức nội bộ để tạo thông báo
  async createNotification(userId: string, title: string, content: string, type: string) {
    return prisma.notification.create({
      data: { userId, title, content, type }
    });
  }

  // Admin gửi thông báo thủ công
  async sendToUser(userId: string, title: string, content: string, type: string = 'SYSTEM') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'Người dùng không tồn tại');

    return this.createNotification(userId, title, content, type);
  }

  // Admin gửi thông báo cho tất cả người dùng
  async broadcast(title: string, content: string, type: string = 'SYSTEM') {
    const users = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } });
    
    const notifications = users.map(user => ({
      userId: user.id,
      title,
      content,
      type
    }));

    return prisma.notification.createMany({
      data: notifications
    });
  }
}
