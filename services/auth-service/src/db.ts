import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/auth',
});

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await pool.query('SELECT id, role FROM users WHERE email = $1', [email]);

  if (!existing.rowCount) {
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query(`INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin')`, [email, passwordHash]);
    console.log(`auth-service: seeded admin user ${email}`);
  } else if (existing.rows[0].role !== 'admin') {
    await pool.query(`UPDATE users SET role = 'admin' WHERE id = $1`, [existing.rows[0].id]);
    console.log(`auth-service: promoted existing user ${email} to admin`);
  }
}
