# server
Xây dựng hệ thống thương mại điện tử tích hợp AI phân tích hành vi và gợi ý sản phẩm cá nhân hóa
npm install
cp .env.example .env   
docker-compose up -d      # Khởi động PostgreSQL + Redis
npm run prisma:migrate -- --name init
npm run dev
npx prisma studio