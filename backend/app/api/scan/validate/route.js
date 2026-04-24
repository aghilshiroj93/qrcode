import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(request) {
  try {
    const { identifier } = await request.json();
    
    const { rows } = await sql`SELECT * FROM members WHERE identifier = ${identifier}`;
    const member = rows[0];
    
    if (member) {
      // Record scan
      await sql`INSERT INTO scans (member_id) VALUES (${member.id})`;

      return NextResponse.json({ 
        status: 'ACCEPTED', 
        data: member 
      });
    } else {
      return NextResponse.json({ 
        status: 'REJECTED', 
        message: 'Data tidak ditemukan' 
      }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
