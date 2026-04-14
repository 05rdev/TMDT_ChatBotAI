import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './product.dto';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = ProductQueryDto.parse(req.query);
    const result = await productService.getAll(query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getBySlug(req.params.slug as string);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = CreateProductDto.parse(req.body);
    const product = await productService.create(data);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = UpdateProductDto.parse(req.body);
    const product = await productService.update(req.params.id as string, data);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.delete(req.params.id as string);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};
