import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { createCategorySchema } from '../dto/product.schema';

const categoryService = new CategoryService();

export class CategoryController {
  /**
   * Lấy danh sách danh mục
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
   * Lấy chi tiết danh mục
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoryService.getById(id as string);
      return res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tạo danh mục mới
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
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

  /**
   * Cập nhật danh mục
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoryService.update(id as string, req.body);
      return res.json({
        success: true,
        message: 'Cập nhật thành công',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa danh mục
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await categoryService.softDelete(id as string);
      return res.json({
        success: true,
        message: 'Đã xóa danh mục'
      });
    } catch (error) {
      next(error);
    }
  }
}
