import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { RevenueService } from '../../order/services/revenue.service';

const aiService = new AIService();
const revenueService = new RevenueService();

export class AdminAIController {
  /**
   * Tóm tắt đánh giá sản phẩm
   */
  async summarizeReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const summary = await aiService.summarizeReviews(productId as string);
      
      return res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Phân tích doanh thu
   */
  async analyzeRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, type } = req.body;
      
      let data: any[];
      if (type === 'monthly') {
        const year = new Date(startDate).getFullYear();
        data = await revenueService.getMonthlyRevenue(year);
      } else {
        data = await revenueService.getDailyRevenue(startDate, endDate);
      }

      const analysis = await aiService.analyzeRevenue(data);
      
      return res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  }
}
