import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { AIService } from '../../ai/services/ai.service';

const productService = new ProductService();
const aiService = new AIService();

export class ProductController {
  /**
   * Lấy danh sách sản phẩm
   */
  async getAll(req: Request, res: Response) {
    try {
      const products = await productService.getAllProducts();
      return res.json({ success: true, data: products });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Lấy chi tiết sản phẩm
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id as string);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
      }
      return res.json({ success: true, data: product });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Tìm kiếm thông minh bằng AI (Semantic Search)
   */
  async searchAI(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp từ khóa tìm kiếm' });
      }

      // 1. Tạo vector embedding từ từ khóa người dùng nhập
      const embedding = await aiService.generateEmbedding(query as string);

      // 2. Tìm kiếm trong database bằng vector
      const products = await productService.searchByVector(embedding);

      return res.json({ 
        success: true, 
        query,
        count: products.length,
        data: products 
      });
    } catch (error: any) {
      console.error('Search AI Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
