import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().uuid('Product ID không hợp lệ'),
  productVariantId: z.string().uuid('Product Variant ID không hợp lệ'),
  quantity: z.number().int().min(1, 'Số lượng phải ít nhất là 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Số lượng không được âm').default(1),
});
