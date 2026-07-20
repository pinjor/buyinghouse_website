import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/orders',
});

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS carts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      product_id UUID NOT NULL,
      product_name TEXT NOT NULL,
      fabric_id UUID NOT NULL,
      style_option_ids UUID[] NOT NULL DEFAULT '{}',
      measurements JSONB NOT NULL DEFAULT '{}',
      unit_price NUMERIC(10,2) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      status TEXT NOT NULL DEFAULT 'placed'
        CHECK (status IN ('placed', 'in_production', 'shipped', 'delivered')),
      total NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id UUID NOT NULL,
      product_name TEXT NOT NULL,
      fabric_id UUID NOT NULL,
      style_option_ids UUID[] NOT NULL DEFAULT '{}',
      measurements JSONB NOT NULL DEFAULT '{}',
      unit_price NUMERIC(10,2) NOT NULL,
      quantity INT NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS measurement_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      label TEXT NOT NULL,
      neck NUMERIC(5,2),
      chest NUMERIC(5,2),
      waist NUMERIC(5,2),
      sleeve_length NUMERIC(5,2),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}
