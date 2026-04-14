import { Router } from 'express';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } from './product.controller';
import { authenticate, authorize } from '@middlewares/auth.middleware';

export const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.get('/:slug', getProductBySlug);

// Admin only
productRouter.post('/', authenticate, authorize(['ADMIN']), createProduct);
productRouter.patch('/:id', authenticate, authorize(['ADMIN']), updateProduct);
productRouter.delete('/:id', authenticate, authorize(['ADMIN']), deleteProduct);
