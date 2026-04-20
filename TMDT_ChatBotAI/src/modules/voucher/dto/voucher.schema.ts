import { z } from 'zod';

export const createVoucherSchema = z.object({
  code: z.string().min(3, 'Mã quá ngắn').toUpperCase(),
  discountType: z.enum(['PERCENT', 'FIXED']),
  discountValue: z.number().min(0, 'Giá trị giảm không hợp lệ'),
  minOrderValue: z.number().optional().nullable(),
  maxDiscount: z.number().optional().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  usageLimit: z.number().int().min(1).default(1),
  categoryId: z.string().uuid().optional().nullable(),
});

export const updateVoucherSchema = createVoucherSchema.partial();
