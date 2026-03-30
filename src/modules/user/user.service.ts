import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@lib/prisma';
import { AppError } from '@middlewares/error.middleware';
import { RegisterInput, LoginInput } from './user.dto';

export class UserService {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(409, 'Email already exists');

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { ...data, password: hashed },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return user;
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new AppError(401, 'Invalid credentials');

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new AppError(401, 'Invalid credentials');

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any },
    );

    return { accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }
}

export const userService = new UserService();
