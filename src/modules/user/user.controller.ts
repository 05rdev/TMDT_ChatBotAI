import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { RegisterDto, LoginDto } from './user.dto';
import { AuthRequest } from '@middlewares/auth.middleware';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = RegisterDto.parse(req.body);
    const user = await userService.register(data);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = LoginDto.parse(req.body);
    const result = await userService.login(data);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getProfile(req.user!.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
