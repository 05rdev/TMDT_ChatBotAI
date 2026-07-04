import { z } from 'zod';

const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  stock: z.number().int().min(0, 'Stock must be greater than or equal to 0'),
  attributes: z.any().optional(),
});

const productAttributeSchema = z.object({
  key: z.string().min(1, 'Attribute key is required'),
  value: z.union([z.string(), z.number(), z.boolean()]),
  unit: z.string().optional().nullable(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  isActive: z.boolean().optional().default(true),
  variants: z.array(productVariantSchema).min(1, 'Product must have at least one variant'),
  attributes: z.array(productAttributeSchema).optional(),
});

export const updateProductSchema = createProductSchema.partial().omit({ slug: true });

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  parentId: z.string().uuid('Invalid parent category ID').optional().nullable(),
  image: z.string().optional().nullable(),
});

export const productQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 20)),
  categoryId: z.string().uuid().optional(),
  minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  rating: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
  sortBy: z.enum(['price', 'createdAt']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  isAdmin: z.string().optional().transform((val) => val === 'true'),
});
