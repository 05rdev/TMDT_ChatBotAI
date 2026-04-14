import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      return res.status(201).json({
        success: true,
        message: 'Đăng ký thành công.',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      return res.json({
        success: true,
        message: 'Đăng nhập thành công.',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // req.user được gán bởi middleware authenticate khi gọi API này
      if (req.user) {
        await authService.logout(req.user.userId);
      }
      return res.json({
        success: true,
        message: 'Đăng xuất thành công.'
      });
    } catch (error) {
      next(error);
    }
  }
}
