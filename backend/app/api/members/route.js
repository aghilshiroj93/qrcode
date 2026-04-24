import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { put } from '@vercel/blob';

export async function GET() {
  try {
    const { rows: members } = await sql`SELECT * FROM members ORDER BY created_at DESC`;
    const { rows: scanRows } = await sql`SELECT COUNT(*) as count FROM scans`;
    const totalScans = parseInt(scanRows[0].count);
    
    const stats = {
      total: members.length,
      divisions: [...new Set(members.map(m => m.divisi))].length,
      scans: totalScans
    };
    return NextResponse.json({ members, stats });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const nama = formData.get('nama');
    const divisi = formData.get('divisi');
    const fotoFile = formData.get('foto');
    
    let fotoUrl = null;
    
    // Upload to Vercel Blob instead of local filesystem
    if (fotoFile && typeof fotoFile !== 'string' && fotoFile.size > 0) {
      const blob = await put(`members/${Date.now()}_${fotoFile.name}`, fotoFile, {
        access: 'public',
      });
      fotoUrl = blob.url;
    }

    const identifier = uuidv4();
    const result = await sql`
      INSERT INTO members (nama, divisi, foto, identifier) 
      VALUES (${nama}, ${divisi}, ${fotoUrl}, ${identifier})
      RETURNING id
    `;
    
    return NextResponse.json({ 
      id: result.rows[0].id, 
      nama, 
      divisi, 
      foto: fotoUrl,
      identifier 
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
