import OpenAI, { toFile } from 'openai';
import { ChatbotService } from './chatbot.service';
import { AIService } from './ai.service';

const chatbotService = new ChatbotService();
const aiService = new AIService();

export class VoiceService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Xử lý giọng nói người dùng
   * Quy trình: Audio -> Whisper (STT) -> Chatbot (RAG) hoặc Search
   */
  async processVoice(userId: string | null, audioBuffer: Buffer, filename: string = 'voice.webm') {
    try {
      // 1. Chuyển đổi giọng nói thành văn bản sử dụng Whisper
      // Chúng ta sử dụng helper 'toFile' của OpenAI để bọc buffer thành một "file" hợp lệ
      const transcription = await this.openai.audio.transcriptions.create({
        file: await toFile(audioBuffer, filename),
        model: 'whisper-1',
        language: 'vi', // Ưu tiên tiếng Việt
      });

      const userText = transcription.text;
      if (!userText || userText.trim().length === 0) {
        throw new Error('Không thể nghe rõ được âm thanh.');
      }

      console.log('🎙️ Voice Transcription Result:', userText);

      // 2. Tự động nhận diện ý định hoặc chuyển sang Chatbot (RAG) để xử lý toàn diện
      // Chatbot của chúng ta đã có cơ chế RAG (Search + Chat), nên nó là lựa chọn tốt nhất
      const result = await chatbotService.askChatbot(userId, userText);

      return {
        transcription: userText,
        ...result
      };
    } catch (error: any) {
      console.error('❌ Voice Processing Error:', error);
      throw new Error('Gặp lỗi khi xử lý giọng nói. Vui lòng thử lại sau.');
    }
  }

  /**
   * Tính năng riêng biệt: Tìm kiếm trực tiếp bằng giọng nói (Không qua chatbot)
   */
  async searchByVoice(audioBuffer: Buffer, filename: string = 'voice.webm') {
    const transcription = await this.openai.audio.transcriptions.create({
      file: await toFile(audioBuffer, filename),
      model: 'whisper-1',
      language: 'vi',
    });

    const userText = transcription.text;
    const products = await aiService.searchSemantic(userText, 10);

    return {
      transcription: userText,
      products
    };
  }
}
