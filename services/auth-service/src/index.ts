import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { pool, migrate } from './db.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './tokens.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

app.post('/register', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount) return res.status(409).json({ error: 'email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role',
    [email, passwordHash],
  );
  const user = result.rows[0];

  const payload = { sub: user.id, email: user.email, role: user.role };
  res.status(201).json({
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: payload,
  });
});

app.post('/login', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;

  const result = await pool.query('SELECT id, email, role, password_hash FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'invalid credentials' });

  const payload = { sub: user.id, email: user.email, role: user.role };
  res.json({
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: payload,
  });
});

app.post('/refresh', (req, res) => {
  const token = req.body?.refreshToken;
  if (!token) return res.status(400).json({ error: 'refreshToken required' });
  try {
    const payload = verifyRefreshToken(token);
    res.json({ accessToken: signAccessToken(payload) });
  } catch {
    res.status(401).json({ error: 'invalid or expired refresh token' });
  }
});

const PORT = process.env.PORT ?? 4001;
migrate()
  .then(() => app.listen(PORT, () => console.log(`auth-service listening on ${PORT}`)))
  .catch((err) => {
    console.error('failed to migrate auth-service db', err);
    process.exit(1);
  });
