import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _supabaseAdmin;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop];
  },
});

export interface License {
  id: number;
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  type: string;
  license_key: string;
  username: string;
  password: string;
  features: string[] | null;
  status: string;
  rent_amount: number;
  created_at: string;
  last_check_at: string | null;
  notes: string | null;
  logo: string | null;
  email: string | null;
  telephone: string | null;
  license_duration: string | null;
  expiry_date: string | null;
  check_frequency_days: number | null;
  warn_days_before: number | null;
}
