import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

export const pool = mysql.createPool(
  process.env.DATABASE_URL ?? 'mysql://root:root@localhost:3306/auth',
);

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'customer',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const [rows] = await pool.query('SELECT id, role FROM users WHERE email = ?', [email]);
  const existing = rows as { id: string; role: string }[];

  if (!existing.length) {
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')`, [email, passwordHash]);
    console.log(`auth-service: seeded admin user ${email}`);
  } else if (existing[0].role !== 'admin') {
    await pool.query(`UPDATE users SET role = 'admin' WHERE id = ?`, [existing[0].id]);
    console.log(`auth-service: promoted existing user ${email} to admin`);
  }
}
