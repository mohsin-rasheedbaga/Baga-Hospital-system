import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();

    // If license_duration is being changed, auto-calculate expiry_date and check_frequency
    if (body.license_duration) {
      body.expiry_date = calculateExpiryDate(body.license_duration);
      body.check_frequency_days = getCheckFrequency(body.license_duration);
    }

    const { data, error } = await supabaseAdmin.from('licenses').update(body).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ license: data });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const { error } = await supabaseAdmin.from('licenses').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
