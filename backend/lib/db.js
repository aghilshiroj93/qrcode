import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

// Force refresh deployment - v2
export const initDb = async () => {
  // Create Tables
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

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS scans (
      id SERIAL PRIMARY KEY,
      member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
      scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // FORCE SEED/UPDATE ADMIN USER
  const adminUsername = 'admin';
  const adminPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Use UPSERT logic
  await sql`
    INSERT INTO users (username, password, role) 
    VALUES (${adminUsername}, ${hashedPassword}, 'admin')
    ON CONFLICT (username) 
    DO UPDATE SET password = ${hashedPassword}
  `;
  
  console.log('Database initialized with forced refresh');
};

export default sql;
