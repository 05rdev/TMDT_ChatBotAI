import { prisma } from '../../../lib/prisma';

export class UserService {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ 
      where: { id },
      select: { id: true, name: true, email: true, phone: true, address: true, role: true, avatar: true }
    });
  }
}
