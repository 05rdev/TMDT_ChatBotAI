import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../middlewares/error.middleware';

export class NotificationService {
  async getMyNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Lấy thông báo cá nhân và thông báo toàn cục
    const [personalNotifications, globalNotifications] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit * 2 // Lấy dư để merge
      }),
      (prisma as any).globalNotification.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    ]);

    // Hợp nhất và sắp xếp theo thời gian
    const allNotifications = [
      ...personalNotifications,
      ...globalNotifications.map((gn: any) => ({
        ...gn,
        userId,
        isRead: false, // Global notifications are always unread in this context unless we track them, but user said they should show every time
        isGlobal: true
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const notifications = allNotifications.slice(skip, skip + limit);
    const total = personalNotifications.length + globalNotifications.length;

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

  // Admin gửi thông báo cho tất cả người dùng (Tạo thông báo toàn cục)
  async broadcast(title: string, content: string, type: string = 'SYSTEM') {
    return (prisma as any).globalNotification.create({
      data: { title, content, type }
    });
  }

  async deleteNotification(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new AppError(404, 'Thông báo không tồn tại');
    if (notification.userId !== userId) throw new AppError(403, 'Không có quyền truy cập');

    return prisma.notification.delete({
      where: { id }
    });
  }

  // Lấy tất cả thông báo toàn cục cho Admin quản lý danh sách
  async getAllForAdmin(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      (prisma as any).globalNotification.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      (prisma as any).globalNotification.count()
    ]);
    return {
      notifications,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  // Admin xóa thông báo toàn cục
  async deleteGlobalNotification(id: string) {
    return (prisma as any).globalNotification.delete({ where: { id } });
  }

  // Admin cập nhật thông báo toàn cục
  async updateGlobalNotification(id: string, data: { title?: string; content?: string; type?: string }) {
    return (prisma as any).globalNotification.update({
      where: { id },
      data
    });
  }
}
