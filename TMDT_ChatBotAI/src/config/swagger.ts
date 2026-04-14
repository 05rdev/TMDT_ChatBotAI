import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UltraShop E-commerce API',
      version: '1.0.0',
      description: 'Tài liệu API cho hệ thống quản lý sản phẩm và thương mại điện tử tích hợp AI',
      contact: {
        name: 'UltraGPT Developer',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.router.ts', './src/modules/**/*.ts'], // Đường dẫn tới các file chứa JSDoc
};

export const swaggerSpec = swaggerJsdoc(options);
