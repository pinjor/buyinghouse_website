import mysql from 'mysql2/promise';

export const pool = mysql.createPool(
  process.env.DATABASE_URL ?? 'mysql://root:root@localhost:3306/orders',
);

export async function migrate() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS carts (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      user_id CHAR(36) NOT NULL UNIQUE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS cart_items (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      cart_id CHAR(36) NOT NULL,
      product_id CHAR(36) NOT NULL,
      product_name TEXT NOT NULL,
      fabric_id CHAR(36) NOT NULL,
      style_option_ids JSON NOT NULL,
      measurements JSON NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS orders (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      user_id CHAR(36) NOT NULL,
      user_email TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending_payment'
        CHECK (status IN ('pending_payment', 'placed', 'in_production', 'shipped', 'delivered')),
      total DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(20),
      payment_intent_id VARCHAR(255),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS order_items (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      order_id CHAR(36) NOT NULL,
      product_id CHAR(36) NOT NULL,
      product_name TEXT NOT NULL,
      fabric_id CHAR(36) NOT NULL,
      style_option_ids JSON NOT NULL,
      measurements JSON NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,

    `CREATE TABLE IF NOT EXISTS measurement_profiles (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      user_id CHAR(36) NOT NULL,
      label TEXT NOT NULL,
      neck DECIMAL(5,2),
      chest DECIMAL(5,2),
      waist DECIMAL(5,2),
      sleeve_length DECIMAL(5,2),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`,
  ];

  for (const statement of statements) {
    await pool.query(statement);
  }
}
