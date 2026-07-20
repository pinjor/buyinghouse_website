import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';

interface AccessPayload {
  sub: string;
  email: string;
  role: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'missing bearer token' });

  try {
    const payload = jwt.verify(header.slice('Bearer '.length), ACCESS_SECRET) as AccessPayload;
    req.headers['x-user-id'] = payload.sub;
    req.headers['x-user-email'] = payload.email;
    req.headers['x-user-role'] = payload.role;
    next();
  } catch {
    res.status(401).json({ error: 'invalid or expired access token' });
  }
}
