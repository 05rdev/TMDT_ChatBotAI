import { Request, Response, NextFunction } from 'express';
import { RevenueService } from '../../order/services/revenue.service';

const revenueService = new RevenueService();

export class AdminStatsController {
  /**
   * Lấy thống kê doanh thu theo ngày hoặc tháng
   */
  async getRevenueStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, start, end, year } = req.query;

      let data;
      if (type === 'month') {
        const queryYear = Number(year) || new Date().getFullYear();
        data = await revenueService.getMonthlyRevenue(queryYear);
      } else {
        // Mặc định là theo ngày (Daily)
        const startDate = (start as string) || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 ngày trước
        const endDate = (end as string) || new Date().toISOString();
        data = await revenueService.getDailyRevenue(startDate, endDate);
      }

      return res.json({
        success: true,
        type: type || 'day',
        data
      });
    } catch (error) {
      next(error);
    }
  }
}
