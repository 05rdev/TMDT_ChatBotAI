import multer from 'multer';
import { AppError } from './error.middleware';

/**
 * Cấu hình Multer sử dụng Memory Storage
 * Hỗ trợ xử lý ảnh cho Visual Search và âm thanh cho Voice Assistant
 */
const storage = multer.memoryStorage();

// Bộ lọc định dạng file
const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  // Chấp nhận hình ảnh và âm thanh
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Chỉ chấp nhận tệp hình ảnh hoặc âm thanh!'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Tăng giới hạn lên 10MB cho cả audio/video ngắn
  },
});
