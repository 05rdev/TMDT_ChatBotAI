import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { redisService } from '../../../lib/redis';
import * as jwtHelper from '../../../utils/jwt.helper';
import { AppError } from '../../../middlewares/error.middleware';


export class AuthService {
  /**
   * Đăng ký tài khoản mới
   */
  async register(data: any) {
    const { email, password, name } = data;

    // 1. Kiểm tra email tồn tại
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError(400, 'Email này đã được sử dụng.');
    }

    // 2. Hash mật khẩu (salt rounds: 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Tạo user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER'
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });

    return user;
  }

  /**
   * Đăng nhập
   */
  async login(data: any) {
    const { email, password } = data;

    // 1. Tìm user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError(401, 'Email hoặc mật khẩu không chính xác.');
    }

    // 2. Tạo tokens
    const payload = { id: user.id, role: user.role };

    const accessToken = jwtHelper.generateAccessToken(payload);
    const refreshToken = jwtHelper.generateRefreshToken(payload);

    // 3. Lưu refresh token vào Redis (7 ngày = 604800s)
    await redisService.set(`refresh_token:${user.id}`, refreshToken, 604800);

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken
    };
  }

  /**
   * Làm mới Access Token từ Refresh Token
   */
  async refresh(token: string) {
    try {
      // 1. Verify token
      const decoded = jwtHelper.verifyRefreshToken(token);

      // 2. Kiểm tra token trong Redis
      const storedToken = await redisService.get(`refresh_token:${decoded.id}`);
      if (!storedToken || storedToken !== token) {
        throw new AppError(401, 'Refresh token không hợp lệ hoặc đã hết hạn.');
      }

      // 3. Tạo access token mới
      const newAccessToken = jwtHelper.generateAccessToken({ 
        id: decoded.id, 
        role: decoded.role 
      });


      return { accessToken: newAccessToken };
    } catch (error) {
      throw new AppError(401, 'Refresh token không hợp lệ.');
    }
  }

  /**
   * Đăng xuất
   */
  async logout(userId: string) {
    await redisService.delete(`refresh_token:${userId}`);
  }
}
