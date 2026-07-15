import { cacheGet, cacheSet } from '../../lib/redis';

/**
 * Helper to handle Embedding generation using Ollama only
 */
export class EmbeddingHelper {
  private ollamaUrl: string;
  private ollamaModel: string;
  private readonly CACHE_TTL_SECONDS = Number(process.env.EMBEDDING_CACHE_TTL || 86400);
  private readonly TIMEOUT_MS = 10_000; // 10 giây timeout

  constructor() {
    this.ollamaUrl = process.env.OLLAMA_URL?.replace('/api/chat', '/api/embeddings')
      || 'http://localhost:11434/api/embeddings';
    this.ollamaModel = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
  }

  /**
   * Sinh vector embedding bằng Ollama
   * Throw lỗi thật sự thay vì trả về mock vector 0 (mock vector gây kết quả tìm kiếm sai)
   */
  async generateEmbedding(text: string, retries: number = 3): Promise<number[]> {
    const cleanText = text.replace(/\n/g, ' ').trim();
    if (!cleanText) throw new Error('Input text is empty');

    const cacheKey = `embedding:${this.ollamaModel}:${Buffer.from(cleanText).toString('base64url').slice(0, 180)}`;
    try {
      const cached = await cacheGet<string>(cacheKey);
      if (cached) {
        const embedding = JSON.parse(cached);
        if (Array.isArray(embedding) && embedding.length > 0) return embedding;
      }
    } catch (error: any) {
      console.warn(`âš ï¸ Embedding cache read failed (${error.message})`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.TIMEOUT_MS);
    const numGpu = process.env.OLLAMA_NUM_GPU !== undefined ? Number(process.env.OLLAMA_NUM_GPU) : undefined;

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.ollamaModel,
          prompt: cleanText,
          keep_alive: -1,
          ...(Number.isFinite(numGpu) ? { options: { num_gpu: numGpu } } : {})
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Ollama API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json() as any;
      if (data.embedding && Array.isArray(data.embedding) && data.embedding.length > 0) {
        try {
          await cacheSet(cacheKey, JSON.stringify(data.embedding), this.CACHE_TTL_SECONDS);
        } catch (error: any) {
          console.warn(`âš ï¸ Embedding cache write failed (${error.message})`);
        }
        return data.embedding;
      }

      throw new Error('Invalid or empty embedding received from Ollama');

    } catch (error: any) {
      clearTimeout(timeout);
      const isAborted = error.name === 'AbortError';
      console.warn(`⚠️ Ollama Embedding Attempt Failed (${isAborted ? 'timeout' : error.message})`);

      if (retries > 0) {
        const delay = isAborted ? 2000 : 1000;
        console.log(`🔄 Retrying embedding... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.generateEmbedding(cleanText, retries - 1);
      }

      // ❌ KHÔNG trả về mock vector 0 — vector toàn 0 cho kết quả cosine distance
      // bằng nhau với mọi sản phẩm, làm cho semantic search hoàn toàn vô nghĩa.
      throw new Error(`Ollama Embedding service unavailable after all retries.`);
    }
  }

  /**
   * Tạo text đầu vào tối ưu cho embedding sản phẩm
   * Combine các trường quan trọng để vector phản ánh đầy đủ nội dung sản phẩm
   */
  static buildProductEmbeddingText(product: {
    name: string;
    description?: string | null;
    categoryName?: string | null;
    attributes?: { key: string; value: string; unit?: string | null }[];
  }): string {
    const parts = [
      product.name,
      product.categoryName ? `Danh mục: ${product.categoryName}` : '',
    ];

    // Thêm attributes ở dạng ngôn ngữ tự nhiên (match cách user hỏi) + dạng cấu trúc
    if (product.attributes && product.attributes.length > 0) {
      const ATTR_LABELS: Record<string, string> = {
        ram: 'RAM', storage: 'bộ nhớ', battery: 'pin', battery_life: 'thời lượng pin',
        screen_size: 'màn hình', screen_tech: 'công nghệ màn hình',
        camera: 'camera', chip: 'chip', cpu: 'vi xử lý', gpu: 'card đồ họa',
        power: 'công suất', capacity: 'dung tích', weight: 'trọng lượng',
        brand: 'thương hiệu', material: 'chất liệu', color: 'màu sắc',
        style: 'phong cách', type: 'loại', gender: 'giới tính',
        connectivity: 'kết nối', os: 'hệ điều hành',
        dimensions: 'kích thước', seats: 'chỗ ngồi',
      };

      // Dạng tự nhiên: "RAM 8 GB, pin 5000 mAh, màn hình 6.7 inch"
      const naturalPhrases = product.attributes.map(a => {
        const label = ATTR_LABELS[a.key] || a.key;
        const unit = a.unit ? ` ${a.unit}` : '';
        return `${label} ${a.value}${unit}`;
      });
      parts.push(naturalPhrases.join(', '));

      // Dạng cấu trúc: "ram: 8 GB, battery: 5000 mAh"
      const structuredText = product.attributes
        .map(a => `${a.key}: ${a.value}${a.unit ? ' ' + a.unit : ''}`)
        .join(', ');
      parts.push(`Thông số: ${structuredText}`);
    }

    if (product.description) {
      parts.push(product.description.substring(0, 500));
    }

    return parts.filter(Boolean).join('. ');
  }
}
