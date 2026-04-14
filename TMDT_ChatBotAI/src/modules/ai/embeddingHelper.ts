import OpenAI from 'openai';

/**
 * Helper to handle OpenAI Embedding generation with retry logic
 */
export class EmbeddingHelper {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generates embedding for a given text using text-embedding-3-small
   */
  async generateEmbedding(text: string, retries: number = 3): Promise<number[]> {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key') {
      console.warn('⚠️ OpenAI API Key missing. Generating Mock Vector...');
      return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.replace(/\n/g, ' '), // Pre-process text
      });

      return response.data[0].embedding;
    } catch (error: any) {
      if (retries > 0 && (error.status === 429 || error.status >= 500)) {
        const delay = error.status === 429 ? 2000 : 1000;
        console.warn(`⚠️ OpenAI Error (${error.status}). Retrying in ${delay}ms... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.generateEmbedding(text, retries - 1);
      }
      
      console.error('❌ Error generating embedding:', error?.message || error);
      throw error;
    }
  }
}
