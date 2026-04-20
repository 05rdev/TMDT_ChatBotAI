import { Router } from 'express';
import { AIController } from './controllers/ai.controller';
import { RecommendationController } from './controllers/recommendation.controller';
import { ChatbotController } from './controllers/chatbot.controller';
import { AdminChatbotController } from './controllers/admin-chatbot.controller';
import { authenticate } from '../../middlewares/authenticate';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();
const aiController = new AIController();
const recommendationController = new RecommendationController();
const chatbotController = new ChatbotController();
const adminChatbotController = new AdminChatbotController();

/**
 * @swagger
 * tags:
 *   name: AI Features
 *   description: Các tính năng thông minh tích hợp AI (Search, Visual, Voice, Chatbot)
 */

// --- Semantic Search ---
router.get('/search', aiController.search);

// --- Visual Search (Tìm kiếm bằng hình ảnh) ---
/**
 * @swagger
 * /api/ai/visual-search:
 *   post:
 *     summary: Tìm kiếm sản phẩm bằng hình ảnh
 *     tags: [AI Features]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 */
router.post('/visual-search', upload.single('file'), aiController.visualSearch);

// --- Voice Assistant (Trợ lý giọng nói) ---
/**
 * @swagger
 * /api/ai/voice-assistant:
 *   post:
 *     summary: Trợ lý giọng nói (STT + Search/Chat)
 *     tags: [AI Features]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 */
router.post('/voice-assistant', upload.single('file'), aiController.voiceAssistant);

// --- Product Recommendations ---
router.get('/similar/:id', recommendationController.getSimilar);
router.get('/recommendations', authenticate, recommendationController.getPersonalized);

// --- Chatbot ---
router.post('/chatbot', chatbotController.chat);
router.get('/chatbot/history', authenticate, chatbotController.getHistory);
router.post('/admin/chatbot', authenticate, adminChatbotController.chat);

// --- Utils ---
router.post('/embed', aiController.generateEmbedding);

export default router;
