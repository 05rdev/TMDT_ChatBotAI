import { Response, NextFunction } from 'express';
import { AdminChatbotService } from '../services/admin-chatbot.service';
import { AuthRequest } from '../../../middlewares/authenticate';

const adminChatbotService = new AdminChatbotService();

export class AdminChatbotController {
  /**
   * Chat dành cho Admin
   */
  async chat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      const adminId = req.user!.id;
      const adminRole = req.user!.role;

      if (adminRole !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập tính năng này' });
      }

      if (!message) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tin nhắn' });
      }

      const reply = await adminChatbotService.askAdminChatbot(adminId, message);
      
      return res.json({
        success: true,
        data: { message: reply }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy lịch sử trò chuyện Admin
   */
  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.id;
      const history = await adminChatbotService.getHistory(adminId);
      
      return res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Làm mới cuộc hội thoại Admin
   */
  async clearChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.id;
      await adminChatbotService.clearHistory(adminId);
      
      return res.json({
        success: true,
        message: 'Đã xóa lịch sử trò chuyện'
      });
    } catch (error) {
      next(error);
    }
  }
}
