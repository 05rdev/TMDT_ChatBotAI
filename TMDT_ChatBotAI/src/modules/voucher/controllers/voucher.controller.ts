import { Request, Response, NextFunction } from 'express';
import { VoucherService } from '../services/voucher.service';
import { createVoucherSchema, updateVoucherSchema } from '../dto/voucher.schema';

const voucherService = new VoucherService();

export class VoucherController {
  // Public - Lấy các voucher khả dụng
  async getActive(req: Request, res: Response, next: NextFunction) {
    try {
      const vouchers = await voucherService.getActiveVouchers();
      return res.json({ success: true, data: vouchers });
    } catch (error) {
      next(error);
    }
  }

  // Checkout - Validate voucher
  async checkValid(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, orderValue, categoryIds } = req.body;
      const result = await voucherService.validateVoucher(code, orderValue, categoryIds || []);
      return res.json({
        success: true,
        message: 'Áp dụng mã giảm giá thành công',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin - Lấy tất cả
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const vouchers = await voucherService.getAll();
      return res.json({ success: true, data: vouchers });
    } catch (error) {
      next(error);
    }
  }

  // Admin - Tạo mới
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createVoucherSchema.parse(req.body);
      const voucher = await voucherService.create(validatedData);
      return res.status(201).json({ success: true, data: voucher });
    } catch (error) {
      next(error);
    }
  }

  // Admin - Cập nhật
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const validatedData = updateVoucherSchema.parse(req.body);
      const voucher = await voucherService.update(id, validatedData);
      return res.json({ success: true, data: voucher });
    } catch (error) {
      next(error);
    }
  }

  // Admin - Xóa (vô hiệu hóa)
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      await voucherService.delete(id);
      return res.json({ success: true, message: 'Đã khóa voucher' });
    } catch (error) {
      next(error);
    }
  }
}
