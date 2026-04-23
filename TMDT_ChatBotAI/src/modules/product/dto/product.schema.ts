import { z } from 'zod';

// Schema cho Product Variant
const productVariantSchema = z.object({
  name: z.string().min(1, 'Tên phiên bản không được để trống'),
  sku: z.string().min(1, 'SKU không được để trống'),
  price: z.number().min(0, 'Giá không được nhỏ hơn 0'),
  stock: z.number().int().min(0, 'Tồn kho không được nhỏ hơn 0'),
  attributes: z.any().optional(),
});

// Schema tạo sản phẩm mới
export const createProductSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  slug: z.string().min(1, 'Slug không được để trống'),
  description: z.string().optional(),
  categoryId: z.string().uuid('Category ID không hợp lệ'),
  isActive: z.boolean().optional().default(true),
  variants: z.array(productVariantSchema).min(1, 'Sản phẩm phải có ít nhất một phiên bản'),
});

// Schema cập nhật sản phẩm
export const updateProductSchema = createProductSchema.partial().omit({ slug: true });

// Schema tạo danh mục
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống'),
  slug: z.string().min(1, 'Slug không được để trống'),
  parentId: z.string().uuid('Parent Category ID không hợp lệ').optional().nullable(),
});

// Schema Query Parameters (Filter/Sort/Pagination)
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
