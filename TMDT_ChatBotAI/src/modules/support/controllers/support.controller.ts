import { Request, Response, NextFunction } from 'express';
import { SupportService } from '../services/support.service';
import { AppError } from '../../../middlewares/error.middleware';
import { AuthRequest } from '../../../middlewares/authenticate';

const supportService = new SupportService();

export class SupportController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'Unauthorized');
      
      const { subject, message } = req.body;
      if (!subject || !message) throw new AppError(400, 'Thiếu thông tin yêu cầu');

      const ticket = await supportService.createTicket(userId, subject, message);
      return res.status(201).json({ success: true, data: ticket });
    } catch (error) {
      next(error);
    }
  }

  async getMyTickets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const tickets = await supportService.getMyTickets(userId);
      return res.json({ success: true, data: tickets });
    } catch (error) {
      next(error);
    }
  }

  async getDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;
      
      // Admin hoặc chủ sở hữu mới xem được
      const ticket = await supportService.getTicketDetails(id, req.user?.role === 'ADMIN' ? undefined : userId);
      return res.json({ success: true, data: ticket });
    } catch (error) {
      next(error);
    }
  }

  async reply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;
      const { content } = req.body;
      
      if (!userId || !content) throw new AppError(400, 'Thông tin không hợp lệ');

      const message = await supportService.replyTicket(id, userId, content);
      return res.json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }

  // Admin
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const tickets = await supportService.getAllTickets(status as string);
      return res.json({ success: true, data: tickets });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const ticket = await supportService.updateStatus(id, status);
      return res.json({ success: true, data: ticket });
    } catch (error) {
      next(error);
    }
  }
}
