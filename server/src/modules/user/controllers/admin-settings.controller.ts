import { Request, Response, NextFunction } from 'express';
import { MaintenanceHelper } from '../../../utils/maintenance.helper';

export class AdminSettingsController {
  /**
   * Lấy cấu hình hệ thống
   */
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      return res.json({
        success: true,
        data: {
          maintenanceMode: MaintenanceHelper.isEnabled()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật cấu hình hệ thống
   */
  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { maintenanceMode } = req.body;
      if (maintenanceMode !== undefined) {
        MaintenanceHelper.setEnabled(Boolean(maintenanceMode));
      }

      return res.json({
        success: true,
        message: 'Cập nhật cấu hình hệ thống thành công',
        data: {
          maintenanceMode: MaintenanceHelper.isEnabled()
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
