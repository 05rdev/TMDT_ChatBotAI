import { prisma } from '../../../common/utils/prisma.service';

export class UserService {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ 
      where: { id },
      select: { id: true, name: true, email: true, role: true, avatar: true }
    });
  }
}
