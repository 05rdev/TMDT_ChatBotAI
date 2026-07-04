import { Request, Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import { AuthRequest } from '../../../middlewares/authenticate';

const recommendationService = new RecommendationService();

export class RecommendationController {
  /**
   * Gợi ý sản phẩm tương tự (Trong trang chi tiết sản phẩm)
   * GET /api/ai/similar/:id
   */
  async getSimilar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const similar = await recommendationService.getSimilarProducts(id, 6);

      return res.json({
        success: true,
        data: similar
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gợi ý cá nhân hóa (Dựa trên hành vi User)
   * GET /api/ai/recommendations
   */
  async getPersonalized(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Endpoint này bắt buộc auth để cá nhân hóa chính xác nhất
      const userId = req.user!.id;
      const recommendations = await recommendationService.getPersonalized(userId, 10);

      return res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      next(error);
    }
  }
}
