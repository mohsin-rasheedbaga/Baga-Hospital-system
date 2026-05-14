import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const MIGRATION_SQL = `-- BAGA Hospital System - Database Migration
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Add new columns to licenses table
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS license_duration TEXT DEFAULT '1month';
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS check_frequency_days INTEGER DEFAULT 1;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS warn_days_before INTEGER DEFAULT 3;

-- Migrate existing city data to address
UPDATE licenses SET address = city WHERE city IS NOT NULL AND address IS NULL;

-- Set license_duration based on existing data (default to 1month for existing)
UPDATE licenses SET license_duration = '1month' WHERE license_duration IS NULL;

-- Set check_frequency_days default
UPDATE licenses SET check_frequency_days = 1 WHERE check_frequency_days IS NULL;

-- Set warn_days_before default
UPDATE licenses SET warn_days_before = 3 WHERE warn_days_before IS NULL;

-- Calculate expiry_date based on license_duration and created_at
UPDATE licenses SET expiry_date = (
  CASE license_duration
    WHEN '1month' THEN created_at + INTERVAL '1 month'
    WHEN '3months' THEN created_at + INTERVAL '3 months'
    WHEN '6months' THEN created_at + INTERVAL '6 months'
    WHEN '1year' THEN created_at + INTERVAL '1 year'
    WHEN 'lifetime' THEN NULL
    ELSE created_at + INTERVAL '1 month'
  END
) WHERE expiry_date IS NULL;

-- Verify migration
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'licenses' 
ORDER BY ordinal_position;`;

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check current schema
    const { data, error } = await getSupabaseAdmin()
      .from('licenses')
      .select('id, city, address, license_duration, expiry_date, check_frequency_days, warn_days_before')
      .limit(1);

    if (error) {
      return NextResponse.json({
        migrated: false,
        error: error.message,
        sql: MIGRATION_SQL,
      });
    }

    // Check if new columns exist by looking at the first row's keys
    const hasNewColumns = data && data.length > 0 && 'address' in data[0];
    
    if (hasNewColumns) {
      return NextResponse.json({
        migrated: true,
        message: 'Database is up to date! All columns exist.',
        columns: Object.keys(data[0]),
      });
    }

    return NextResponse.json({
      migrated: false,
      message: 'New columns not found. Please run the migration SQL below in Supabase Dashboard > SQL Editor.',
      sql: MIGRATION_SQL,
      currentColumns: data && data.length > 0 ? Object.keys(data[0]) : [],
    });
  } catch {
    return NextResponse.json({ migrated: false, sql: MIGRATION_SQL });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { sql } = await request.json();

    if (!sql) {
      return NextResponse.json({
        success: false,
        message: 'Please run the migration SQL manually in Supabase Dashboard > SQL Editor.',
        sql: MIGRATION_SQL,
      });
    }

    // We cannot execute raw SQL via the Supabase REST API
    // Return the SQL for the user to run manually
    return NextResponse.json({
      success: false,
      message: 'Raw SQL execution is not supported via REST API. Please run the migration SQL in Supabase Dashboard > SQL Editor.',
      sql: MIGRATION_SQL,
    });
  } catch {
    return NextResponse.json({ error: 'Migration check failed' }, { status: 500 });
  }
}
