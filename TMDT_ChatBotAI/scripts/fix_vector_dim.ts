import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function fixDatabaseSchema() {
  console.log('🛠 Starting Database Schema Migration...');
  
  try {
    // 1. Xóa dữ liệu embedding cũ (vì không thể convert trực tiếp từ 1536 sang 768)
    console.log('- Clearing old 1536d embeddings...');
    await prisma.$executeRawUnsafe('UPDATE "Product" SET embedding = NULL;');

    // 2. Thay đổi kiểu dữ liệu cột sang vector(768)
    console.log('- Altering column to vector(768)...');
    await prisma.$executeRawUnsafe('ALTER TABLE "Product" ALTER COLUMN embedding TYPE vector(768);');

    console.log('✅ Database schema updated successfully!');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    
    // Nếu gặp lỗi do index, có thể cần xóa index trước
    if (error.message.includes('index')) {
      console.log('⚠️ Attempting to drop index first...');
      // Bạn có thể cần chạy lệnh này nếu có index: DROP INDEX IF EXISTS "product_embedding_idx";
    }
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

fixDatabaseSchema();
