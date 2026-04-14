import { Response, NextFunction } from 'express';
import { orderService } from './order.service';
import { CreateOrderDto } from './order.dto';
import { AuthRequest } from '@middlewares/auth.middleware';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = CreateOrderDto.parse(req.body);
    const order = await orderService.create(req.user!.id, data);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await orderService.getMyOrders(req.user!.id, page, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.getById(req.params.id as string, req.user!.id);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
