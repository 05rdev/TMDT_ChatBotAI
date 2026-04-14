import OpenAI from 'openai';
import { AIService } from './ai.service';

const aiService = new AIService();

export class VisualSearchService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Tìm kiếm sản phẩm bằng hình ảnh
   * Quy trình: Ảnh -> GPT-4o Vision (Phân tích) -> Text Query -> Semantic Search
   */
  async searchByImage(imageBuffer: Buffer, mimetype: string) {
    // 1. Chuyển đổi buffer sang base64 để gửi lên OpenAI Vision
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimetype};base64,${base64Image}`;

    try {
      // 2. Sử dụng GPT-4o Vision để phân tích đặc điểm sản phẩm
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Hãy đóng vai một chuyên gia phân tích sản phẩm thương mại điện tử. Hãy nhìn vào bức ảnh này và mô tả ngắn gọn (trong khoảng 20-30 từ) về loại sản phẩm, màu sắc, kiểu dáng, và các đặc điểm nổi bật nhất để tôi có thể dùng đoạn mô tả này tìm kiếm sản phẩm trong kho. Trả về kết quả là một chuỗi văn bản thuần túy.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      });

      const productDescription = response.choices[0].message.content;

      if (!productDescription) {
        throw new Error('Không thể phân tích được hình ảnh sản phẩm.');
      }

      console.log('🔍 Visual Analysis Result:', productDescription);

      // 3. Thực hiện Semantic Search dựa trên mô tả vừa trích xuất được
      const results = await aiService.searchSemantic(productDescription, 6);

      return {
        description: productDescription,
        products: results
      };
    } catch (error: any) {
      console.error('❌ Visual Search Error:', error);
      throw new Error('Gặp lỗi khi phân tích hình ảnh. Vui lòng thử lại sau.');
    }
  }
}
