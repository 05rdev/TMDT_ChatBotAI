import { Request, Response, NextFunction } from 'express';
import { ChatbotService } from '../services/chatbot.service';
import { AuthRequest } from '../../../middlewares/authenticate';

const chatbotService = new ChatbotService();

export class ChatbotController {
  /**
   * API Chat trực tiếp (User & Guest)
   */
  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      // Lấy userId nếu có (Middleware authenticate có thể gán req.user)
      const userId = (req as any).user?.id || null;

      if (!message) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập tin nhắn' });
      }

      const result = await chatbotService.askChatbot(userId, message);
      
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy lịch sử trò chuyện (Chỉ User đã đăng nhập)
   */
  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const history = await chatbotService.getHistory(userId);
      
      return res.json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Làm mới cuộc hội thoại
   */
  async clearChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await chatbotService.clearHistory(userId);
      
      return res.json({
        success: true,
        message: 'Đã xóa lịch sử trò chuyện'
      });
    } catch (error) {
      next(error);
    }
  }
}
