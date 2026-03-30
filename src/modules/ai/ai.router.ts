import { Router } from 'express';
import { chat, semanticSearch } from './ai.controller';
import { authenticate } from '@middlewares/auth.middleware';

export const aiRouter = Router();

aiRouter.get('/search', semanticSearch);         // Public: semantic search sản phẩm
aiRouter.post('/chat', authenticate, chat);       // Auth: AI chat tư vấn
