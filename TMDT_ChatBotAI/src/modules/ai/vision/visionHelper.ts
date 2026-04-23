import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export class VisionHelper {
  private clipUrl: string;
  private readonly TIMEOUT_MS = 30_000; // 30 giây cho xử lý ảnh

  constructor() {
    this.clipUrl = process.env.CLIP_SERVICE_URL || 'http://localhost:5005';
  }

  /**
   * Kiểm tra xem service CLIP có đang chạy không
   */
  async isServiceReady(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.clipUrl}/health`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sinh image embedding bằng model CLIP (qua Python sidecar)
   * @param imageSource Có thể là đường dẫn file cục bộ hoặc Buffer
   */
  async generateImageEmbedding(imageSource: string | Buffer): Promise<number[]> {
    try {
      const formData = new FormData();
      
      if (typeof imageSource === 'string') {
        if (imageSource.startsWith('http')) {
          // Nếu là URL, tải về trước (hoặc có thể sửa Python service để nhận URL)
          const response = await axios.get(imageSource, { responseType: 'arraybuffer' });
          formData.append('image', Buffer.from(response.data), 'image.jpg');
        } else {
          formData.append('image', fs.createReadStream(imageSource));
        }
      } else {
        formData.append('image', imageSource, 'image.jpg');
      }

      const response = await axios.post(`${this.clipUrl}/embed`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: this.TIMEOUT_MS,
      });

      if (response.data && Array.isArray(response.data.embedding)) {
        return response.data.embedding;
      }

      throw new Error('Invalid response from CLIP service');
    } catch (error: any) {
      console.error('❌ VisionHelper Error:', error.message);
      throw new Error(`Failed to generate image embedding: ${error.message}`);
    }
  }
}
