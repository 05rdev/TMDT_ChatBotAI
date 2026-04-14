import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  role: string;
}

export class JWTHelper {
  private static readonly ACCESS_SECRET = process.env.JWT_SECRET || 'access-secret';
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
  private static readonly ACCESS_EXPIRE = process.env.JWT_EXPIRE || '15m';
  private static readonly REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

  static signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.ACCESS_SECRET, { expiresIn: this.ACCESS_EXPIRE as any });
  }

  static signRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.REFRESH_SECRET, { expiresIn: this.REFRESH_EXPIRE as any });
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.ACCESS_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, this.REFRESH_SECRET) as TokenPayload;
  }
}
