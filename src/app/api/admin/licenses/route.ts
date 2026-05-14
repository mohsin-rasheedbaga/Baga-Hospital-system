import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, type License } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';

    let query = supabaseAdmin.from('licenses').select('*').order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,phone.ilike.%${search}%,license_key.ilike.%${search}%`);
    }
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ licenses: data as License[] });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, city, phone, type, features, status, rent_amount, notes } = body;

    if (!name) return NextResponse.json({ error: 'Hospital name required' }, { status: 400 });

    const prefix = type === 'pharmacy' ? 'UW-PH' : type === 'clinic' ? 'UW-CL' : 'UWH';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const licenseKey = `${prefix}-${timestamp}-${random}`;

    const cleanName = name.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '').toLowerCase();
    const baseUsername = cleanName.substring(0, 15) || 'hospital';
    const username = `${baseUsername}_${Math.random().toString(36).substring(2, 6)}`;
    const password = 'UWH@' + Math.random().toString(36).substring(2, 8) + '#';

    const { data, error } = await supabaseAdmin
      .from('licenses')
      .insert({ name, city: city || null, phone: phone || null, type: type || 'hospital', license_key: licenseKey, username, password, features: features || [], status: status || 'active', rent_amount: rent_amount || 0, notes: notes || null })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ license: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
