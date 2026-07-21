import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`missing required env var ${name} — refusing to start with a known/default JWT secret`);
    process.exit(1);
  }
  return value;
}

const ACCESS_SECRET = requireEnv('JWT_ACCESS_SECRET');

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

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.headers['x-user-role'] !== 'admin') return res.status(403).json({ error: 'admin access required' });
  next();
}
