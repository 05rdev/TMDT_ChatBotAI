import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../middlewares/error.middleware';

export class NotificationService {
  async getMyNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [personalNotifications, globalNotifications] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit * 2,
      }),
      (prisma as any).globalNotification.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ]);

    const allNotifications = [
      ...personalNotifications,
      ...globalNotifications.map((notification: any) => ({
        ...notification,
        userId,
        isRead: false,
        isGlobal: true,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const notifications = allNotifications.slice(skip, skip + limit);
    const total = personalNotifications.length + globalNotifications.length;

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification) {
      const globalNotification = await (prisma as any).globalNotification.findUnique({ where: { id } });
      if (globalNotification) return globalNotification;
      throw new AppError(404, 'Thong bao khong ton tai');
    }

    if (notification.userId !== userId) throw new AppError(403, 'Khong co quyen truy cap');

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async createNotification(userId: string, title: string, content: string, type: string) {
    return prisma.notification.create({
      data: { userId, title, content, type },
    });
  }

  async sendToUser(userId: string, title: string, content: string, type: string = 'SYSTEM') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'Nguoi dung khong ton tai');

    return this.createNotification(userId, title, content, type);
  }

  async broadcast(title: string, content: string, type: string = 'SYSTEM') {
    return (prisma as any).globalNotification.create({
      data: { title, content, type },
    });
  }

  async deleteNotification(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification) {
      const globalNotification = await (prisma as any).globalNotification.findUnique({ where: { id } });
      if (globalNotification) return globalNotification;
      throw new AppError(404, 'Thong bao khong ton tai');
    }

    if (notification.userId !== userId) throw new AppError(403, 'Khong co quyen truy cap');

    return prisma.notification.delete({
      where: { id },
    });
  }

  async getAllForAdmin(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      (prisma as any).globalNotification.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).globalNotification.count(),
    ]);

    return {
      notifications,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async deleteGlobalNotification(id: string) {
    return (prisma as any).globalNotification.delete({ where: { id } });
  }

  async updateGlobalNotification(id: string, data: { title?: string; content?: string; type?: string }) {
    return (prisma as any).globalNotification.update({
      where: { id },
      data,
    });
  }
}
