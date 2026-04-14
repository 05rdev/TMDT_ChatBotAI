import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { createCategorySchema } from '../dto/product.schema';

const categoryService = new CategoryService();

export class CategoryController {
  /**
   * API lấy danh sách danh mục
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getAll();
      return res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * API tạo danh mục (Admin)
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate dữ liệu đầu vào
      const validatedData = createCategorySchema.parse(req.body);
      
      const category = await categoryService.create(validatedData);
      return res.status(201).json({
        success: true,
        message: 'Tạo danh mục thành công',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }
}
