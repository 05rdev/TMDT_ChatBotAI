import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';

const aiService = new AIService();

export class AIController {
  /**
   * Sinh vector embedding cho một đoạn văn bản (Dùng để test)
   */
  async generateEmbedding(req: Request, res: Response) {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp văn bản (text)' });
      }

      const embedding = await aiService.generateEmbedding(text);
      return res.json({ success: true, data: embedding });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
