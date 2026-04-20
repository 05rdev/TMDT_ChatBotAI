import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../../../middlewares/authenticate';

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

  async refreshToken(req: Request, res: Response, next: NextFunction) {
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

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await authService.getProfile(userId);
      return res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await authService.logout(req.user.id);
      }
      return res.json({
        success: true,
        message: 'Đăng xuất thành công.'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await authService.updateProfile(userId, req.body);
      return res.json({
        success: true,
        message: 'Cập nhật thông tin thành công.',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await authService.changePassword(userId, req.body);
      return res.json({
        success: true,
        message: 'Đổi mật khẩu thành công.'
      });
    } catch (error) {
      next(error);
    }
  }
}
