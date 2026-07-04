import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { normalizeProductAttributes, buildAttributeEmbeddingText } from '../src/modules/product/attribute-taxonomy';
import { EmbeddingHelper } from '../src/modules/ai/embeddingHelper';

dotenv.config();

const prisma = new PrismaClient();
const embeddingHelper = new EmbeddingHelper();
const shouldReindex = process.argv.includes('--reindex');

function getOllamaConfig() {
  const embeddingsUrl = process.env.OLLAMA_URL?.replace('/api/chat', '/api/embeddings')
    || 'http://localhost:11434/api/embeddings';
  const model = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
  const baseUrl = embeddingsUrl.replace(/\/api\/embeddings\/?$/, '');
  return { embeddingsUrl, model, baseUrl };
}

async function assertOllamaReady() {
  const { embeddingsUrl, model, baseUrl } = getOllamaConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(embeddingsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: 'health check',
        keep_alive: -1,
        options: { num_gpu: 0 },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}${body ? ` - ${body}` : ''}`);
    }

    const data = await response.json() as { embedding?: unknown };
    if (!Array.isArray(data.embedding) || data.embedding.length === 0) {
      throw new Error('response did not contain an embedding vector');
    }
  } catch (error: any) {
    const reason = error?.name === 'AbortError' ? 'request timed out' : error?.message || String(error);
    throw new Error([
      `Ollama embedding service is not ready (${reason}).`,
      `Checked: ${embeddingsUrl}`,
      `Model: ${model}`,
      '',
      'Start Ollama and make sure the embedding model exists, then run again:',
      '  ollama serve',
      `  ollama pull ${model}`,
      '  npm run ai:attributes:reindex',
      '',
      `If Ollama runs on another address, set OLLAMA_URL, for example: OLLAMA_URL=${baseUrl}/api/embeddings`,
    ].join('\n'));
  } finally {
    clearTimeout(timeout);
  }
}

async function updateEmbedding(productId: string, text: string) {
  const embedding = await embeddingHelper.generateEmbedding(text, 1);
  const vectorString = `[${embedding.join(',')}]`;

  await prisma.$executeRawUnsafe(
    `UPDATE "Product" SET embedding = $1::vector WHERE id = $2`,
    vectorString,
    productId
  );
}

async function main() {
  if (shouldReindex) {
    console.log('Checking Ollama embedding service...');
    await assertOllamaReady();
    console.log('Ollama embedding service is ready.\n');
  }

  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    include: {
      category: { select: { name: true } },
      variants: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  console.log(`Backfilling AI attributes for ${products.length} products...`);
  console.log(`Embedding reindex: ${shouldReindex ? 'enabled' : 'disabled'}\n`);

  let attributesUpdated = 0;
  let embeddingsUpdated = 0;
  let failed = 0;

  for (const [index, product] of products.entries()) {
    try {
      const attrs = normalizeProductAttributes({
        name: product.name,
        description: product.description,
        categoryName: product.category?.name,
        variants: product.variants,
        attributes: [],
      });

      await prisma.$transaction(async (tx) => {
        await tx.productAttribute.deleteMany({ where: { productId: product.id } });
        if (attrs.length > 0) {
          await tx.productAttribute.createMany({
            data: attrs.map((attr) => ({
              productId: product.id,
              key: attr.key,
              value: attr.value,
              unit: attr.unit || null,
            })),
            skipDuplicates: true,
          });
        }
      });

      attributesUpdated++;

      if (shouldReindex) {
        const embeddingText = buildAttributeEmbeddingText({
          name: product.name,
          description: product.description,
          categoryName: product.category?.name,
          variants: product.variants,
          attributes: attrs,
        });
        await updateEmbedding(product.id, embeddingText);
        embeddingsUpdated++;
      }

      console.log(`[${index + 1}/${products.length}] ${product.name} -> ${attrs.length} attrs${shouldReindex ? ', embedding updated' : ''}`);
    } catch (error: any) {
      failed++;
      console.error(`Failed: ${product.name}: ${error.message}`);
      if (shouldReindex && /Ollama|fetch failed|embedding service/i.test(error.message || '')) {
        console.error('\nEmbedding service failed during reindex, stopping early to avoid repeated retries.');
        break;
      }
    }
  }

  console.log('\nDone.');
  console.log(`Attributes updated: ${attributesUpdated}`);
  if (shouldReindex) console.log(`Embeddings updated: ${embeddingsUpdated}`);
  console.log(`Failed: ${failed}`);
}

main()
  .catch((error) => {
    console.error(error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
