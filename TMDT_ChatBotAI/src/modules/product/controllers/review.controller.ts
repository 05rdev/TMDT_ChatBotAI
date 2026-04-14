import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { AuthRequest } from '../../../middlewares/authenticate';

const reviewService = new ReviewService();

export class ReviewController {
  /**
   * Tạo đánh giá mới
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId as string;
      const userId = req.user!.id;
      const review = await reviewService.createReview(userId, productId, req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Cảm ơn bạn đã đánh giá sản phẩm',
        data: review
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Danh sách đánh giá sản phẩm
   */
  async getByProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId as string;
      const result = await reviewService.getProductReviews(productId, req.query);
      
      return res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sửa đánh giá
   */
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const review = await reviewService.updateReview(id, userId, req.body);
      
      return res.json({
        success: true,
        message: 'Cập nhật đánh giá thành công',
        data: review
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa đánh giá
   */
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const isAdmin = req.user!.role === 'ADMIN';
      
      await reviewService.deleteReview(id, userId, isAdmin);
      
      return res.json({
        success: true,
        message: 'Đã xóa đánh giá'
      });
    } catch (error) {
      next(error);
    }
  }
}
