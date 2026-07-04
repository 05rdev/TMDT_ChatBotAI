import { prisma } from '../../../lib/prisma';

export class BannerService {
  async getAll(onlyActive = false) {
    return prisma.banner.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: { order: 'asc' }
    });
  }

  async getById(id: string) {
    return prisma.banner.findUnique({
      where: { id }
    });
  }

  async create(data: { title: string; subtitle?: string; imageUrl: string; link?: string; order?: number; isActive?: boolean }) {
    return prisma.banner.create({
      data
    });
  }

  async update(id: string, data: { title?: string; subtitle?: string; imageUrl?: string; link?: string; order?: number; isActive?: boolean }) {
    return prisma.banner.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.banner.delete({
      where: { id }
    });
  }
}
