import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../../lib/prisma';
import { redisService } from '../../../lib/redis';
import * as jwtHelper from '../../../utils/jwt.helper';
import { AppError } from '../../../middlewares/error.middleware';
import { mailService } from '../../mail/mail.service';

export class AuthService {
  async register(data: any) {
    const { email, password, name, phone, address } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError(400, 'Email nay da duoc su dung.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        address,
        role: 'USER',
      },
      select: { id: true, email: true, name: true, phone: true, address: true, role: true, createdAt: true },
    });
  }

  async login(data: any) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError(401, 'Email hoac mat khau khong chinh xac.');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Tai khoan cua ban da bi khoa. Vui long lien he ho tro.');
    }

    const payload = { id: user.id, role: user.role };
    const accessToken = jwtHelper.generateAccessToken(payload);
    const refreshToken = jwtHelper.generateRefreshToken(payload);

    await redisService.set(`refresh_token:${user.id}`, refreshToken, 604800);

    return {
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone, address: user.address, role: user.role, avatar: user.avatar },
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    try {
      const decoded = jwtHelper.verifyRefreshToken(token);
      const storedToken = await redisService.get(`refresh_token:${decoded.id}`);
      if (!storedToken || storedToken !== token) {
        throw new AppError(401, 'Refresh token khong hop le hoac da het han.');
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || !user.isActive) {
        throw new AppError(403, 'Tai khoan da bi khoa hoac khong ton tai.');
      }

      const accessToken = jwtHelper.generateAccessToken({
        id: decoded.id,
        role: decoded.role,
      });

      return { accessToken };
    } catch {
      throw new AppError(401, 'Refresh token khong hop le.');
    }
  }

  async logout(userId: string) {
    await redisService.delete(`refresh_token:${userId}`);
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, phone: true, address: true, role: true, avatar: true, createdAt: true },
    });
    if (!user) throw new AppError(404, 'Nguoi dung khong ton tai.');
    return user;
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, isActive: true },
    });

    // Always return true to avoid revealing registered emails.
    if (!user || !user.isActive) return true;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresMinutes = 15;
    await redisService.set(`password_reset:${token}`, user.id, expiresMinutes * 60);

    const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`;

    void mailService.sendPasswordReset(user, resetUrl, expiresMinutes).catch((error) => {
      console.error('Failed to send password reset email', error);
    });

    return true;
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword || newPassword.length < 6) {
      throw new AppError(400, 'Token hoac mat khau moi khong hop le.');
    }

    const userId = await redisService.get(`password_reset:${token}`);
    if (!userId) {
      throw new AppError(400, 'Link dat lai mat khau khong hop le hoac da het han.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await redisService.delete(`password_reset:${token}`);
    await redisService.delete(`refresh_token:${userId}`);

    return true;
  }

  async updateProfile(userId: string, data: any) {
    const { name, avatar, phone, address } = data;
    return prisma.user.update({
      where: { id: userId },
      data: { name, avatar, phone, address },
      select: { id: true, email: true, name: true, phone: true, address: true, role: true, avatar: true, createdAt: true },
    });
  }

  async changePassword(userId: string, data: any) {
    const { oldPassword, newPassword } = data;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'Nguoi dung khong ton tai.');

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      throw new AppError(401, 'Mat khau cu khong chinh xac.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await redisService.delete(`refresh_token:${userId}`);
    return true;
  }
}
