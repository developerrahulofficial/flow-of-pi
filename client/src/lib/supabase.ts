import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://izufxqibregiggcivsxk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dWZ4cWlicmVnaWdnY2l2c3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTQwMjcsImV4cCI6MjA4NDc3MDAyN30.dqy49I4Ja_sWk4E4FBYn-y6dI1KUUTdtaqnVgGg5IUw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
