import { z } from 'zod';

export const createOrderSchema = z.object({
  address: z.string().min(5, 'Địa chỉ giao hàng phải chi tiết hơn (tối thiểu 5 ký tự)'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ (tối thiểu 10 số)'),
  paymentMethod: z.enum(['COD', 'STRIPE', 'MOMO', 'VNPAY']).default('COD'),
  voucherCode: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});
