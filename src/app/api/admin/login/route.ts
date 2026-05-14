import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 });
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    const token = Buffer.from(`admin:${Date.now()}`).toString('base64');
    return NextResponse.json({ success: true, token });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
