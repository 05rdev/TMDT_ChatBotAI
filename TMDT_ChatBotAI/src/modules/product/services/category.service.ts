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

  /**
   * Lấy chi tiết danh mục
   */
  async getById(id: string) {
    const category = await prisma.category.findFirst({
      where: { id, isDeleted: false },
      include: { children: true, parent: true }
    });
    if (!category) throw new AppError(404, 'Không tìm thấy danh mục');
    return category;
  }

  /**
   * Cập nhật danh mục
   */
  async update(id: string, data: any) {
    await this.getById(id);
    return prisma.category.update({
      where: { id },
      data
    });
  }

  /**
   * Xóa mềm danh mục
   */
  async softDelete(id: string) {
    await this.getById(id);
    return prisma.category.update({
      where: { id },
      data: { isDeleted: true }
    });
  }
}
