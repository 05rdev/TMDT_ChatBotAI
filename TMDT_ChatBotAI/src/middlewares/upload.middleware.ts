import multer from 'multer';
import { AppError } from './error.middleware';

/**
 * Cấu hình Multer sử dụng Memory Storage
 * Chúng ta sẽ chuyển tiếp buffer này lên Cloudinary thay vì lưu trực tiếp xuống đĩa
 */
const storage = multer.memoryStorage();

// Bộ lọc định dạng file
const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Chỉ chấp nhận tệp hình ảnh!'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
