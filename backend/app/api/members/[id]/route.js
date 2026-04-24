import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { put } from '@vercel/blob';

export async function PUT(request, { params }) {
  const { id } = await params;
  
  try {
    const formData = await request.formData();
    const nama = formData.get('nama');
    const divisi = formData.get('divisi');
    const fotoFile = formData.get('foto');
    
    let fotoUrl = formData.get('existingFoto') || null;
    
    if (fotoFile && typeof fotoFile !== 'string' && fotoFile.size > 0) {
      const blob = await put(`members/${Date.now()}_${fotoFile.name}`, fotoFile, {
        access: 'public',
      });
      fotoUrl = blob.url;
    }

    const result = await sql`
      UPDATE members 
      SET nama = ${nama}, divisi = ${divisi}, foto = ${fotoUrl} 
      WHERE id = ${id}
      RETURNING id
    `;
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Data updated successfully', foto: fotoUrl });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  
  try {
    const result = await sql`DELETE FROM members WHERE id = ${id}`;
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Data deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
