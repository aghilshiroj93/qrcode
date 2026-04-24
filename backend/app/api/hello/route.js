import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: "Halo dari Next.js API!",
    status: "success",
    timestamp: new Date().toISOString()
  });
}
