import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../middlewares/error.middleware';

export class CategoryService {
  /**
   * Lấy danh sách danh mục (Không bao gồm mục đã xóa)
   */
  async getAll() {
    return prisma.category.findMany({
      where: { isDeleted: false },
      include: {
        children: {
          where: { isDeleted: false }
        }
      }
    });
  }

  /**
   * Tạo danh mục mới
   */
  async create(data: any) {
    const { name, slug, parentId } = data;

    // Kiểm tra slug trùng lặp
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError(400, 'Slug danh mục đã tồn tại');
    }

    return prisma.category.create({
      data: {
        name,
        slug,
        parentId
      }
    });
  }
}
