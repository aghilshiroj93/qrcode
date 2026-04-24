import { sql } from '@vercel/postgres';

// Note: In development, you can use a local Postgres or 
// keep using SQLite by wrapping this in a conditional.
// For now, we are migrating to the Vercel-ready PostgreSQL pattern.

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
};

export default sql;
