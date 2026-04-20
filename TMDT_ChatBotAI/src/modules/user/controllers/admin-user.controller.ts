import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../lib/prisma';
import { UserRole } from '@prisma/client';

export class AdminUserController {
  /**
   * Lấy danh sách tất cả users
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          avatar: true,
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật trạng thái người dùng (Khóa / Mở khóa)
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { isActive } = req.body;
      
      const user = await prisma.user.update({
        where: { id },
        data: { isActive: Boolean(isActive) },
        select: { id: true, email: true, isActive: true }
      });
      
      return res.json({
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật vai trò (Role)
   */
  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { role } = req.body;
      
      const user = await prisma.user.update({
        where: { id },
        data: { role: role as UserRole },
        select: { id: true, email: true, role: true }
      });
      
      return res.json({
        success: true,
        message: 'Cập nhật vai trò thành công',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật thông tin người dùng (tên, email)
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { name, email } = req.body;
      
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: { id: true, name: true, email: true, role: true, isActive: true }
      });
      
      return res.json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa người dùng (Soft delete - vô hiệu hóa tài khoản)
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      
      await prisma.user.update({
        where: { id },
        data: { isActive: false }
      });
      
      return res.json({
        success: true,
        message: 'Đã vô hiệu hóa người dùng'
      });
    } catch (error) {
      next(error);
    }
  }
}
