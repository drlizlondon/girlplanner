
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ckcfgpmzftmklrnhxepj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrY2ZncG16ZnRta2xybmh4ZXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5Njk4OTMsImV4cCI6MjA1NDU0NTg5M30.t7aoz7Qyloy1t8YzphjINHAw0vsa0J1uZCMNMevLepI';

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase Anon Key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
