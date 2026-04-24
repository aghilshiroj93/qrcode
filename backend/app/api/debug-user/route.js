import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await sql`SELECT id, username, role, created_at FROM users`;
    return NextResponse.json({ 
      total_users: rows.length,
      users: rows 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
