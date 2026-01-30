import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const SUPABASE_URL = 'https://decndldnjmuesytdpxib.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY25kbGRuam11ZXN5dGRweGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NzUzMDYsImV4cCI6MjA4NTM1MTMwNn0.inP804S4wCMu-9Oe2JievzGcS--bRkshyrOI0jwi87E';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
