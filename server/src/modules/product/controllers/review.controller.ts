import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { createReviewSchema } from '../dto/review.schema';
import { AuthRequest } from '../../../middlewares/auth.middleware';

const reviewService = new ReviewService();

export class ReviewController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const validatedData = createReviewSchema.parse(req.body);
      
      const review = await reviewService.createReview(userId, validatedData);
      
      return res.status(201).json({
        success: true,
        message: 'Cảm ơn bạn đã đánh giá sản phẩm!',
        data: review
      });
    } catch (error) {
      next(error);
    }
  }

  async getByProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId as string;
      const reviews = await reviewService.getProductReviews(productId);
      
      return res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const review = await reviewService.updateReview(userId, id, req.body);
      
      return res.json({
        success: true,
        message: 'Cập nhật đánh giá thành công',
        data: review
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      await reviewService.deleteReview(userId, id);
      
      return res.json({
        success: true,
        message: 'Đã xóa đánh giá'
      });
    } catch (error) {
      next(error);
    }
  }
}
