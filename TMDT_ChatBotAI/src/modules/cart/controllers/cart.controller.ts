import { Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { addToCartSchema, updateCartItemSchema } from '../dto/cart.schema';
import { AuthRequest } from '../../../middlewares/authenticate';

const cartService = new CartService();

export class CartController {
  /**
   * Lấy giỏ hàng
   */
  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const cart = await cartService.getCart(userId);
      return res.json({
        success: true,
        data: cart
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thêm sản phẩm
   */
  async add(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const validatedData = addToCartSchema.parse(req.body);
      const item = await cartService.addItem(userId, validatedData);
      
      return res.status(201).json({
        success: true,
        message: 'Đã thêm sản phẩm vào giỏ hàng',
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật số lượng
   */
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const productVariantId = req.params.productId as string;
      const { quantity } = updateCartItemSchema.parse(req.body);
      
      const item = await cartService.updateItem(userId, productVariantId, quantity);
      
      return res.json({
        success: true,
        message: 'Cập nhật giỏ hàng thành công',
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa một sản phẩm
   */
  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const productVariantId = req.params.productId as string;
      
      await cartService.removeItem(userId, productVariantId);
      
      return res.json({
        success: true,
        message: 'Đã xóa sản phẩm khỏi giỏ hàng'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa toàn bộ giỏ
   */
  async clear(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await cartService.clearCart(userId);
      
      return res.json({
        success: true,
        message: 'Đã làm trống giỏ hàng'
      });
    } catch (error) {
      next(error);
    }
  }
}
