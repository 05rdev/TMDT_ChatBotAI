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

    const voucher = await prisma.voucher.create({ data });

    // Tự động gửi thông báo đến toàn bộ người dùng
    try {
      const allUsers = await prisma.user.findMany({ select: { id: true }, where: { role: 'USER' } });
      if (allUsers.length > 0) {
        const notifications = allUsers.map(user => ({
          userId: user.id,
          title: '🎁 Mã giảm giá mới dành cho bạn!',
          content: `Mã ${voucher.code} giảm giá ${voucher.discountType === 'PERCENT' ? voucher.discountValue + '%' : Number(voucher.discountValue).toLocaleString() + 'đ'}. Đừng bỏ lỡ!`,
          type: 'PROMOTION'
        }));
        await prisma.notification.createMany({ data: notifications });
      }
    } catch (err) {
      console.error('Lỗi gửi thông báo Voucher:', err);
    }

    return voucher;
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

  async validateVoucher(code: string, orderValue: number, categoryIds: string[], userId?: string, productIds?: string[]) {
    const voucher = await prisma.voucher.findUnique({ where: { code } });
    if (!voucher) throw new AppError(404, 'Mã giảm giá không tồn tại');
    
    if (!voucher.isActive) throw new AppError(400, 'Mã giảm giá đã bị khóa');
    
    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      throw new AppError(400, 'Mã giảm giá đã hết hạn hoặc chưa áp dụng');
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      throw new AppError(400, 'Mã giảm giá đã hết lượt sử dụng chung');
    }

    // Nếu truyền userId, kiểm tra xem người dùng đã từng xài mã này chưa (Chỉ được xài 1 lần/user)
    if (userId) {
      const existingOrder = await prisma.order.findFirst({
        where: {
          userId,
          voucherId: voucher.id,
          status: { not: 'CANCELLED' } // Bỏ qua đơn đã hủy
        }
      });
      if (existingOrder) {
        throw new AppError(400, 'Bạn đã sử dụng mã giảm giá này rồi. Mỗi người chỉ được dùng 1 lần!');
      }
    }

    if (voucher.minOrderValue && orderValue < Number(voucher.minOrderValue)) {
      throw new AppError(400, `Đơn hàng phải từ ${Number(voucher.minOrderValue).toLocaleString()}đ`);
    }

    // Nếu voucher yêu cầu danh mục cụ thể
    if (voucher.categoryId && categoryIds && !categoryIds.includes(voucher.categoryId)) {
      throw new AppError(400, 'Mã giảm giá không áp dụng cho danh mục sản phẩm trong giỏ hàng');
    }

    // Nếu voucher yêu cầu sản phẩm cụ thể
    if ((voucher as any).productId && productIds && !productIds.includes((voucher as any).productId)) {
      throw new AppError(400, 'Mã giảm giá không áp dụng cho sản phẩm này');
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
