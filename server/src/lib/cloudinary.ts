import { v2 as cloudinary } from 'cloudinary';

// Cấu hình Cloudinary
// Bạn cần điền thông tin vào .env sau khi khởi tạo
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret',
});

/**
 * Helper để upload ảnh từ Buffer (Multer memory storage) lên Cloudinary
 */
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string = 'tmdt_chatbot'
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Ghi buffer vào stream
    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
