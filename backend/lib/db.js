import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export const initDb = async () => {
  // Create Members Table
  await sql`
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      nama VARCHAR(255) NOT NULL,
      divisi VARCHAR(255) NOT NULL,
      foto TEXT,
      identifier VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create Users Table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create Scans Table
  await sql`
    CREATE TABLE IF NOT EXISTS scans (
      id SERIAL PRIMARY KEY,
      member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
      scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // AUTO-SEED ADMIN USER
  const adminUsername = 'admin';
  const adminPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Check if admin exists, if not, create it
  const { rows } = await sql`SELECT * FROM users WHERE username = ${adminUsername}`;
  if (rows.length === 0) {
    await sql`
      INSERT INTO users (username, password, role) 
      VALUES (${adminUsername}, ${hashedPassword}, 'admin')
    `;
    console.log('Admin user seeded during initDb');
  }
};

export default sql;
