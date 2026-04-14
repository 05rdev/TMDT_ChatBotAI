import { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service';
import { ChatDto, SearchDto } from './ai.dto';
import { AuthRequest } from '@middlewares/auth.middleware';

export const chat = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = ChatDto.parse(req.body);
    const result = await aiService.chat(data, req.user?.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const semanticSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = SearchDto.parse(req.query);
    const products = await aiService.semanticSearch(data);
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};
