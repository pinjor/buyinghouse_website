import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}
