import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface License {
  id: number;
  name: string;
  city: string | null;
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
}
