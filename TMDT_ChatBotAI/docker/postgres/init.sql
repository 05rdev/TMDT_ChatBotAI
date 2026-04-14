-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable uuid-ossp extension (optional, Prisma dùng cuid mặc định)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
