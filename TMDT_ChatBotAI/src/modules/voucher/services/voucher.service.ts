import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../middlewares/error.middleware';

export class VoucherService {
  async getAll() {
    return prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActiveVouchers() {
    const now = new Date();
    // Prisma does not support WHERE usedCount < usageLimit directly, so we fetch and filter
    const active = await prisma.voucher.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { endDate: 'asc' }
    });
    
    return active.filter(v => v.usedCount < v.usageLimit);
  }
  
  async create(data: any) {
    const existing = await prisma.voucher.findUnique({ where: { code: data.code } });
    if (existing) throw new AppError(400, 'Mã voucher đã tồn tại');

    return prisma.voucher.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.voucher.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.voucher.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async validateVoucher(code: string, orderValue: number, categoryIds: string[]) {
    const voucher = await prisma.voucher.findUnique({ where: { code } });
    if (!voucher) throw new AppError(404, 'Mã giảm giá không tồn tại');
    
    if (!voucher.isActive) throw new AppError(400, 'Mã giảm giá đã bị khóa');
    
    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      throw new AppError(400, 'Mã giảm giá đã hết hạn hoặc chưa áp dụng');
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      throw new AppError(400, 'Mã giảm giá đã hết lượt sử dụng');
    }

    if (voucher.minOrderValue && orderValue < Number(voucher.minOrderValue)) {
      throw new AppError(400, `Đơn hàng phải từ ${Number(voucher.minOrderValue).toLocaleString()}đ`);
    }

    // Nếu voucher yêu cầu danh mục cụ thể
    if (voucher.categoryId && !categoryIds.includes(voucher.categoryId)) {
      throw new AppError(400, 'Mã giảm giá không áp dụng cho sản phẩm trong giỏ hàng');
    }

    let discountAmount = 0;
    if (voucher.discountType === 'PERCENT') {
      discountAmount = (orderValue * Number(voucher.discountValue)) / 100;
      if (voucher.maxDiscount && discountAmount > Number(voucher.maxDiscount)) {
        discountAmount = Number(voucher.maxDiscount);
      }
    } else {
      discountAmount = Number(voucher.discountValue);
    }

    return { voucher, discountAmount };
  }
}
