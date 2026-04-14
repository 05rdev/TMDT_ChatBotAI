import OpenAI from 'openai';

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Tạo vector embedding từ văn bản sử dụng model text-embedding-3-small (1536 dims)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // Nếu không có API KEY, tự động bật chế độ MOCK (dành cho Dev)
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key') {
      console.warn('⚠️ OpenAI API Key chưa được cấu hình. Đang sử dụng Mock Vector...');
      return this.generateMockVector();
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error: any) {
      // Nếu lỗi do hết tiền (429), trong môi trường dev ta sẽ fallback sang mock để không gián đoạn
      if (error.status === 429 && process.env.NODE_ENV !== 'production') {
        console.error('❌ OpenAI Quota Exceeded. Fallback to Mock Vector...');
        return this.generateMockVector();
      }
      
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Tạo vector ngẫu nhiên để phát triển không cần internet hoặc API Key
   */
  private generateMockVector(): number[] {
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }
}
