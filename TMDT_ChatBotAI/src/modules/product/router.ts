import { Router } from 'express';
import { ProductController } from './controllers/product.controller';

const router = Router();
const productController = new ProductController();

// Route lấy tất cả sản phẩm
router.get('/', productController.getAll);

// Route tìm kiếm bằng AI (Semantic Search)
router.get('/search-ai', productController.searchAI);

// Route lấy chi tiết sản phẩm
router.get('/:id', productController.getById);

export default router;
