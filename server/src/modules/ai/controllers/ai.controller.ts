import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { VisualSearchService } from '../services/visual-search.service';
import { VoiceService } from '../services/voice.service';
import { AuthRequest } from '../../../middlewares/authenticate';

const aiService = new AIService();
const visualSearchService = new VisualSearchService();
const voiceService = new VoiceService();

export class AIController {
  /**
   * Sinh vector embedding cho một đoạn văn bản (Dùng để test)
   */
  async generateEmbedding(req: Request, res: Response, next: NextFunction) {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp văn bản (text)' });
      }

      const embedding = await aiService.generateEmbedding(text);
      return res.json({ success: true, data: embedding });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Tìm kiếm Semantic thông minh (Semantic Search)
   * GET /api/ai/search?q=...
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp từ khóa tìm kiếm (q)' });
      }

      const results = await aiService.intelligentSearch(query);
      
      return res.json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * TÌm kiếm bằng hình ảnh (Visual Search)
   * POST /api/ai/visual-search
   */
  async visualSearch(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng tải lên một hình ảnh' });
      }

      const result = await visualSearchService.searchByImage(req.file.buffer, req.file.mimetype);
      
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Trợ lý giọng nói (Voice Assistant)
   * POST /api/ai/voice-assistant
   */
  async voiceAssistant(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp file âm thanh' });
      }

      const userId = req.user?.id || null;
      const result = await voiceService.processVoice(
        userId, 
        req.file.buffer, 
        req.file.originalname
      );
      
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
