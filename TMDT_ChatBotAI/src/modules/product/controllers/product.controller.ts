import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { AIService } from '../../ai/services/ai.service';
import { productQuerySchema, createProductSchema, updateProductSchema } from '../dto/product.schema';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { AppError } from '../../../middlewares/error.middleware';

const productService = new ProductService();
const aiService = new AIService();

export class ProductController {
  /**
   * Lấy danh sách sản phẩm (Public)
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedQuery = productQuerySchema.parse(req.query);
      const result = await productService.getProducts(validatedQuery);
      return res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sản phẩm bán chạy nhất (Hot)
   */
  async getHotProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 8;
      const products = await productService.getHotProducts(limit);
      return res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sản phẩm mới nhất
   */
  async getNewProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 8;
      const products = await productService.getNewProducts(limit);
      return res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Chi tiết sản phẩm bằng Slug (Public - SEO)
   */
  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await productService.getBySlug(slug as string);
      return res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Chi tiết sản phẩm bằng ID (Public)
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.getById(id as string);
      return res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tạo sản phẩm mới (Admin)
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createProductSchema.parse(req.body);
      const product = await productService.create(validatedData);
      
      return res.status(201).json({
        success: true,
        message: 'Tạo sản phẩm thành công',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật sản phẩm (Admin)
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateProductSchema.parse(req.body);
      const product = await productService.update(id as string, validatedData);
      
      return res.json({
        success: true,
        message: 'Cập nhật sản phẩm thành công',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa mềm sản phẩm (Admin)
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await productService.softDelete(id as string);
      return res.json({
        success: true,
        message: 'Xóa sản phẩm thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload nhiều ảnh lên Cloudinary
   */
  async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new AppError(400, 'Vui lòng chọn ít nhất một ảnh');
      }

      // Duyệt qua và upload từng file lên Cloudinary
      const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, `products/${id}`));
      const uploadResults = await Promise.all(uploadPromises);
      
      const imageUrls = uploadResults.map(result => result.secure_url);

      // Lưu link ảnh vào database
      await productService.addImages(id as string, imageUrls);

      return res.json({
        success: true,
        message: `Đã tải lên ${imageUrls.length} ảnh thành công`,
        data: imageUrls
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tìm kiếm thông minh bằng AI (Sử dụng pgvector)
   */
  async searchAI(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        throw new AppError(400, 'Vui lòng cung cấp từ khóa tìm kiếm');
      }

      const embedding = await aiService.generateEmbedding(query as string);
      const products = await productService.searchByVector(embedding);

      return res.json({ 
        success: true, 
        query,
        count: products.length,
        data: products 
      });
    } catch (error) {
      next(error);
    }
  }
}
