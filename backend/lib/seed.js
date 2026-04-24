require('dotenv').config();
const { db } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await db.connect();

  console.log('🌱 Seeding Vercel Database...');

  try {
    // Create Users Table if not exists
    await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create admin user
    const username = 'admin';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.sql`
      INSERT INTO users (username, password, role) 
      VALUES (${username}, ${hashedPassword}, 'admin')
      ON CONFLICT (username) DO UPDATE SET password = ${hashedPassword}
    `;

    console.log('✅ Admin user created/updated successfully');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await client.release();
  }

  process.exit(0);
}

seed();
