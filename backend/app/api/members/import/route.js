import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Bulk insert with Postgres (simple loop for small-medium data)
    for (const member of data) {
      const nama = member.nama || member.Nama;
      const divisi = member.divisi || member.Divisi;
      const identifier = uuidv4();
      
      await sql`
        INSERT INTO members (nama, divisi, identifier) 
        VALUES (${nama}, ${divisi}, ${identifier})
      `;
    }

    return NextResponse.json({ message: `${data.length} data imported successfully` });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
