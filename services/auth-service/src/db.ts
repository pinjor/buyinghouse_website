import pg from 'pg';

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
