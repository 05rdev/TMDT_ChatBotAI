import OpenAI from 'openai';

/**
 * Helper to handle Embedding generation using Ollama or OpenAI
 */
export class EmbeddingHelper {
  private openai?: OpenAI;
  private ollamaUrl: string;
  private ollamaModel: string;

  constructor() {
    this.ollamaUrl = process.env.OLLAMA_URL?.replace('/api/chat', '/api/embeddings') || 'http://localhost:11434/api/embeddings';
    this.ollamaModel = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
    
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai-api-key')) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Generates embedding for a given text
   */
  async generateEmbedding(text: string, retries: number = 3): Promise<number[]> {
    const cleanText = text.replace(/\n/g, ' ');

    // Try Ollama first as per user request to use Ollama for all text AI
    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.ollamaModel,
          prompt: cleanText,
        }),
      });

      if (response.ok) {
        const data = await response.json() as any;
        if (data.embedding) return data.embedding;
      }
    } catch (error: any) {
      console.warn(`⚠️ Ollama Embedding Error: ${error.message}. Checking fallback...`);
    }

    // Fallback to OpenAI if configured and Ollama fails
    if (this.openai) {
      try {
        const response = await this.openai.embeddings.create({
          model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
          input: cleanText,
        });
        return response.data[0].embedding;
      } catch (error: any) {
        if (retries > 0 && (error.status === 429 || error.status >= 500)) {
          const delay = error.status === 429 ? 2000 : 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.generateEmbedding(text, retries - 1);
        }
        console.error('❌ OpenAI Embedding Error:', error?.message || error);
      }
    }

    // Ultimate fallback: Mock Vector
    console.warn('⚠️ No embedding provider available. Generating Mock Vector (768d)...');
    return Array.from({ length: 768 }, () => Math.random() * 2 - 1);
  }
}
