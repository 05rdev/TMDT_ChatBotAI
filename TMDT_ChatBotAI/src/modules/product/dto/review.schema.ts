import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().uuid('ID sản phẩm không hợp lệ'),
  rating: z.number().min(1).max(5, 'Đánh giá từ 1 đến 5 sao'),
  comment: z.string().min(1, 'Vui lòng để lại bình luận').max(500, 'Bình luận không quá 500 ký tự'),
});
