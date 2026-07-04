import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../lib/prisma';
import { UserRole } from '@prisma/client';
import { AppError } from '../../../middlewares/error.middleware';

export class AdminUserController {
  /**
   * Lấy danh sách tất cả users
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const search = (req.query.search as string)?.trim() || '';
      const role = (req.query.role as string)?.toUpperCase() || '';
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (role && ['ADMIN', 'USER'].includes(role)) {
        where.role = role;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            avatar: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);
      
      return res.json({
        success: true,
        data: users,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
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
      const targetActiveStatus = Boolean(isActive);

      // Nếu muốn vô hiệu hóa/khóa người dùng
      if (!targetActiveStatus) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
          throw new AppError(404, 'Người dùng không tồn tại');
        }

        // 1. Nếu là admin, kiểm tra xem có phải là admin duy nhất hoạt động không
        if (user.role === 'ADMIN') {
          const adminCount = await prisma.user.count({
            where: { role: 'ADMIN', isActive: true }
          });
          if (adminCount <= 1) {
            throw new AppError(400, 'Không thể khóa tài khoản admin duy nhất của hệ thống.');
          }
        }

        // 2. Kiểm tra xem còn đơn hàng chưa hoàn thành không (PENDING, PROCESSING, SHIPPED)
        const unfinishedOrdersCount = await prisma.order.count({
          where: {
            userId: id,
            status: {
              in: ['PENDING', 'PROCESSING', 'SHIPPED']
            }
          }
        });
        if (unfinishedOrdersCount > 0) {
          throw new AppError(400, 'Không thể khóa người dùng này vì họ đang có đơn hàng chưa hoàn thành.');
        }
      }
      
      const user = await prisma.user.update({
        where: { id },
        data: { isActive: targetActiveStatus },
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
   * Xóa người dùng (Soft delete - vô hiệu hóa tài khoản hoặc ẩn danh hóa)
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const anonymize = req.query.anonymize === 'true' || req.body.action === 'anonymize';

      // 1. Kiểm tra xem user có tồn tại không
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new AppError(404, 'Người dùng không tồn tại');
      }

      // 2. Nếu là admin, kiểm tra xem có phải là admin duy nhất hoạt động không
      if (user.role === 'ADMIN') {
        const adminCount = await prisma.user.count({
          where: { role: 'ADMIN', isActive: true }
        });
        if (adminCount <= 1) {
          throw new AppError(400, 'Không thể xóa/vô hiệu hóa tài khoản admin duy nhất của hệ thống.');
        }
      }

      // 3. Kiểm tra xem còn đơn hàng chưa hoàn thành không (PENDING, PROCESSING, SHIPPED)
      const unfinishedOrdersCount = await prisma.order.count({
        where: {
          userId: id,
          status: {
            in: ['PENDING', 'PROCESSING', 'SHIPPED']
          }
        }
      });
      if (unfinishedOrdersCount > 0) {
        throw new AppError(400, 'Không thể vô hiệu hóa người dùng này vì họ đang có đơn hàng chưa hoàn thành.');
      }

      if (anonymize) {
        // Thực hiện ẩn danh hóa thông tin cá nhân (GDPR anonymization) để bảo lưu dữ liệu mua hàng nhưng xóa PII
        await prisma.user.update({
          where: { id },
          data: {
            name: `User Anonymized ${id.slice(0, 8)}`,
            email: `deleted_${id.slice(0, 8)}@deleted.tmdt.com`,
            password: 'ANONYMIZED_PASSWORD',
            avatar: null,
            isActive: false
          }
        });
        return res.json({
          success: true,
          message: 'Đã ẩn danh hóa dữ liệu người dùng thành công theo GDPR.'
        });
      } else {
        // Chỉ vô hiệu hóa tài khoản (Khóa tài khoản)
        await prisma.user.update({
          where: { id },
          data: { isActive: false }
        });
        return res.json({
          success: true,
          message: 'Đã vô hiệu hóa người dùng'
        });
      }
    } catch (error) {
      next(error);
    }
  }
}
