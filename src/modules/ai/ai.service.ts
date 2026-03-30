import OpenAI from 'openai';
import { prisma } from '@lib/prisma';
import { cacheGet, cacheSet } from '@lib/redis';
import { ChatInput, SearchInput } from './ai.dto';
import logger from '@config/logger';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIService {
  /**
   * Tạo embedding vector 1536 chiều cho text
   */
  async createEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }

  /**
   * Semantic search sản phẩm qua pgvector cosine similarity
   */
  async semanticSearch(input: SearchInput): Promise<Array<{ id: string; name: string; slug: string; price: number; similarity: number }>> {
    const cacheKey = `ai:search:${input.query}:${input.topK}`;
    const cached = await cacheGet<Array<{ id: string; name: string; slug: string; price: number; similarity: number }>>(cacheKey);
    if (cached) return cached;

    const embedding = await this.createEmbedding(input.query);
    const vectorStr = `[${embedding.join(',')}]`;

    // Dùng queryRawUnsafe và ép kiểu kết quả để tránh lỗi typing khi Prisma chưa generate đầy đủ
    const products = (await prisma.$queryRawUnsafe(
      `
      SELECT id, name, slug, price,
        1 - (embedding <=> $1::vector) AS similarity
      FROM products
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT $2
      `,
      vectorStr,
      input.topK,
    )) as Array<{ id: string; name: string; slug: string; price: number; similarity: number }>;

    await cacheSet(cacheKey, products, 600);
    return products;
  }

  /**
   * AI chat với context sản phẩm (RAG đơn giản)
   */
  async chat(input: ChatInput, userId?: string) {
    // Tìm sản phẩm liên quan qua semantic search
    let productContext = '';
    try {
      const relatedProducts = await this.semanticSearch({ query: input.message, topK: 3 });
      if (relatedProducts.length > 0) {
        productContext = `\nSản phẩm liên quan:\n${relatedProducts
          .map((p: { name: string; price: number }) => `- ${p.name}: ${p.price.toLocaleString('vi-VN')}đ`)
          .join('\n')}`;
      }
    } catch (err) {
      logger.warn('AI semantic search failed, continuing without context:', err);
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Bạn là trợ lý mua sắm AI thân thiện. Hãy tư vấn sản phẩm dựa trên nhu cầu khách hàng.${productContext}`,
        },
        { role: 'user', content: input.message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || 'Xin lỗi, tôi không thể xử lý yêu cầu này.';

    // Log behavior nếu có userId
    if (userId) {
      logger.info(`AI chat - userId: ${userId}, message: ${input.message.substring(0, 50)}`);
    }

    return { reply, usage: response.usage };
  }
}

export const aiService = new AIService();
