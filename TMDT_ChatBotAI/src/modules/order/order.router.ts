import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById } from './order.controller';
import { authenticate } from '@middlewares/auth.middleware';

export const orderRouter = Router();

orderRouter.use(authenticate); // Tất cả order routes đều cần auth

orderRouter.post('/', createOrder);
orderRouter.get('/', getMyOrders);
orderRouter.get('/:id', getOrderById);
