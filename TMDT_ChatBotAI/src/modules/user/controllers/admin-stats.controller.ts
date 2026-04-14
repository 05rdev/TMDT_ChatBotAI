import { Request, Response, NextFunction } from 'express';
import { RevenueService } from '../../order/services/revenue.service';
import { AdminStatsService } from '../services/admin-stats.service';

const revenueService = new RevenueService();
const adminStatsService = new AdminStatsService();

export class AdminStatsController {
  /**
   * Lấy tổng quan Dashboard
   */
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminStatsService.getDashboardOverview();
      return res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sản phẩm bán chạy
   */
  async getTopProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 10;
      const data = await adminStatsService.getTopSellingProducts(limit);
      return res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Doanh thu theo danh mục
   */
  async getCategoryStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminStatsService.getCategoryRevenue();
      return res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy thống kê doanh thu biểu đồ (Daily/Monthly)
   */
  async getRevenueTrend(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, start, end, year } = req.query;

      let data;
      if (type === 'month') {
        const queryYear = Number(year) || new Date().getFullYear();
        data = await revenueService.getMonthlyRevenue(queryYear);
      } else {
        const startDate = (start as string) || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
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

  /**
   * Lấy danh sách sản phẩm sắp hết hàng cùng thông tin chi tiết
   */
  async getLowStock(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminStatsService.getLowStockProducts();
      return res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}
