import { z } from 'zod';

export const CreateProductDto = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  categoryId: z.string(),
});

export const UpdateProductDto = CreateProductDto.partial();

export const ProductQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  q: z.string().optional(), // text search
});

export type CreateProductInput = z.infer<typeof CreateProductDto>;
export type UpdateProductInput = z.infer<typeof UpdateProductDto>;
export type ProductQueryInput = z.infer<typeof ProductQueryDto>;
