import { Request, Response, NextFunction } from 'express';
import { BannerService } from '../services/banner.service';
import { AppError } from '../../../middlewares/error.middleware';
import { uploadToCloudinary } from '../../../lib/cloudinary';

const bannerService = new BannerService();

export class BannerController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { active } = req.query;
      const banners = await bannerService.getAll(active === 'true');
      return res.json({ success: true, data: banners });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await bannerService.getById(req.params.id as string);
      if (!banner) throw new AppError(404, 'Banner không tồn tại');
      return res.json({ success: true, data: banner });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await bannerService.create(req.body);
      return res.status(201).json({ success: true, data: banner });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await bannerService.update(req.params.id as string, req.body);
      return res.json({ success: true, data: banner });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await bannerService.delete(req.params.id as string);
      return res.json({ success: true, message: 'Xóa banner thành công' });
    } catch (error) {
      next(error);
    }
  }

  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        throw new AppError(400, 'Vui lòng chọn ảnh');
      }

      const result = await uploadToCloudinary(file.buffer, 'banners');
      
      return res.json({
        success: true,
        message: 'Tải ảnh lên thành công',
        data: {
          url: result.secure_url
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
