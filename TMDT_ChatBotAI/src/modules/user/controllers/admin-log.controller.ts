import { Request, Response, NextFunction } from 'express';
import { ActivityLogService } from '../services/activity-log.service';

export class AdminLogController {
  async listLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await ActivityLogService.getLogs(page, limit);

      return res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}
