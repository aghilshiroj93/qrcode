import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Add CORS headers helper
function addCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 204 }));
}

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return addCorsHeaders(NextResponse.json({ error: 'Username and password are required' }, { status: 400 }));
    }

    const { rows } = await sql`SELECT * FROM users WHERE username = ${username}`;
    
    if (rows.length === 0) {
      return addCorsHeaders(NextResponse.json({ error: 'DEBUG: User not found in database' }, { status: 401 }));
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return addCorsHeaders(NextResponse.json({ error: 'DEBUG: Password does not match' }, { status: 401 }));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return addCorsHeaders(NextResponse.json({ error: 'DEBUG: JWT_SECRET is missing in server environment' }, { status: 500 }));
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '1d' }
    );

    return addCorsHeaders(NextResponse.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    }));
  } catch (error) {
    console.error('Login error:', error);
    return addCorsHeaders(NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 }));
  }
}
