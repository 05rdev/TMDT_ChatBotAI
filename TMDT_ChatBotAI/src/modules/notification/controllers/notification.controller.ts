import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../../middlewares/authenticate';
import { NotificationService } from '../services/notification.service';
import { AppError } from '../../../middlewares/error.middleware';

const notificationService = new NotificationService();

export class NotificationController {
  // Lấy danh sách thông báo của user hiện tại
  async getMyNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let userId = req.user?.id;
      const paramUserId = req.params.userId as string;
      
      // Nếu có userId trong params, ưu tiên sử dụng (phục vụ cho các request cũ hoặc admin)
      if (paramUserId) {
        userId = paramUserId;
      }

      if (!userId) throw new AppError(401, 'Unauthorized');

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const data = await notificationService.getMyNotifications(userId, page, limit);
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // Đánh dấu 1 thông báo là đã đọc
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;
      if (!userId) throw new AppError(401, 'Unauthorized');

      await notificationService.markAsRead(id, userId);
      return res.json({ success: true, message: 'Đã đánh dấu đọc' });
    } catch (error) {
      next(error);
    }
  }

  // Đánh dấu tất cả là đã đọc
  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'Unauthorized');

      await notificationService.markAllAsRead(userId);
      return res.json({ success: true, message: 'Đã đánh dấu tất cả đã đọc' });
    } catch (error) {
      next(error);
    }
  }

  // Admin gửi thông báo cho 1 user
  async sendToUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, title, content, type } = req.body;
      const notification = await notificationService.sendToUser(userId as string, title as string, content as string, type as string);
      return res.status(201).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  // Admin broadcast cho tất cả users
  async broadcast(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, content, type } = req.body;
      const result = await notificationService.broadcast(title as string, content as string, type as string);
      return res.status(201).json({ success: true, message: `Đã gửi ${result.count} thông báo` });
    } catch (error) {
      next(error);
    }
  }

  // Xóa 1 thông báo
  async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;
      if (!userId) throw new AppError(401, 'Unauthorized');

      await notificationService.deleteNotification(id, userId);
      return res.json({ success: true, message: 'Đã xóa thông báo' });
    } catch (error) {
      next(error);
    }
  }
}
