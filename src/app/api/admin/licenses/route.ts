import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    let query = getSupabaseAdmin().from('licenses').select('*').order('created_at', { ascending: false });
    if (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%,phone.ilike.%${search}%,license_key.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Auto-check expiry and update status
    const now = new Date();
    const updatedLicenses = await Promise.all(
      (data || []).map(async (license: any) => {
        if (license.license_duration === 'lifetime') return license;

        if (license.expiry_date) {
          const expiry = new Date(license.expiry_date);
          const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          let expiryStatus: string | null = null;
          if (daysUntilExpiry <= 0) {
            expiryStatus = 'expired';
          } else if (daysUntilExpiry <= (license.warn_days_before || 3)) {
            expiryStatus = 'expiring_soon';
          }

          // Auto-deactivate expired licenses
          if (daysUntilExpiry <= 0 && license.status === 'active') {
            await getSupabaseAdmin().from('licenses').update({ status: 'inactive' }).eq('id', license.id);
            license.status = 'inactive';
          }

          return { ...license, days_until_expiry: daysUntilExpiry, expiry_status: expiryStatus };
        }
        return { ...license, days_until_expiry: null, expiry_status: null };
      })
    );

    return NextResponse.json({ licenses: updatedLicenses });
  } catch { return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 }); }
}

function calculateExpiryDate(duration: string): string | null {
  if (duration === 'lifetime') return null;
  const now = new Date();
  switch (duration) {
    case '1month': now.setMonth(now.getMonth() + 1); break;
    case '3months': now.setMonth(now.getMonth() + 3); break;
    case '6months': now.setMonth(now.getMonth() + 6); break;
    case '1year': now.setFullYear(now.getFullYear() + 1); break;
    default: now.setMonth(now.getMonth() + 1); break;
  }
  return now.toISOString().split('T')[0];
}

function getCheckFrequency(duration: string): number {
  return duration === 'lifetime' ? 0 : 1;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const { name, address, phone, type, features, status, rent_amount, notes, email, telephone, logo, license_duration } = body;

    if (!name) return NextResponse.json({ error: 'Client name required' }, { status: 400 });

    // BAGA license key prefix
    const prefix = type === 'pharmacy' ? 'BAGA-PH' : type === 'clinic' ? 'BAGA-CL' : 'BAGA';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const licenseKey = `${prefix}-${timestamp}-${random}`;

    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const baseUsername = cleanName.substring(0, 15) || 'hospital';
    const username = `${baseUsername}_${Math.random().toString(36).substring(2, 6)}`;
    const password = 'BAGA@' + Math.random().toString(36).substring(2, 8) + '#';

    const duration = license_duration || '1month';
    const expiryDate = calculateExpiryDate(duration);
    const checkFrequency = getCheckFrequency(duration);
    const warnDays = 3;

    const { data, error } = await getSupabaseAdmin().from('licenses').insert({
      name,
      city: null,
      address: address || null,
      phone: phone || null,
      type: type || 'hospital',
      license_key: licenseKey,
      username,
      password,
      features: features || [],
      status: status || 'active',
      rent_amount: rent_amount || 0,
      notes: notes || null,
      email: email || null,
      telephone: telephone || null,
      logo: logo || null,
      license_duration: duration,
      expiry_date: expiryDate,
      check_frequency_days: checkFrequency,
      warn_days_before: warnDays,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ license: data }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Failed to create' }, { status: 500 }); }
}
