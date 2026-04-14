import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import { AppError } from '../../middlewares/error.middleware';
import { cacheSet, cacheGet, cacheDel } from '../../lib/redis';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.helper';

export const register = async (data: any) => {
  const { name, email, password } = data;

  const passStr = String(password || '');

  if (!email || !passStr || passStr.length < 8) {
    throw new AppError(400, 'Invalid input: email and password (>= 8 chars) are required');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError(400, 'Email already in use');
  }

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.create({
    data: {
      name: name || 'User',
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const login = async (data: any) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new AppError(400, 'Email and password are required');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid credentials');
  }

  const payload = { id: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const REDIS_TTL_7DAYS = 7 * 24 * 60 * 60; // 7 days in seconds
  const redisKey = `refresh_token:${user.id}`;
  await cacheSet(redisKey, refreshToken, REDIS_TTL_7DAYS);

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError(400, 'Refresh token is required');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  const userId = decoded.id;
  const redisKey = `refresh_token:${userId}`;
  const storedToken = await cacheGet<string>(redisKey);

  if (!storedToken || storedToken !== refreshToken) {
    throw new AppError(401, 'Refresh token has been revoked or is invalid');
  }

  const payload = { id: decoded.id, role: decoded.role };
  const newAccessToken = generateAccessToken(payload);

  return { accessToken: newAccessToken };
};

export const logout = async (userId: string) => {
  const redisKey = `refresh_token:${userId}`;
  await cacheDel(redisKey);
  return { message: 'Logged out successfully' };
};
