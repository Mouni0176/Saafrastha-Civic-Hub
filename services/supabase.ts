import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://guarulduoydtmdifcnur.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YXJ1bGR1b3lkdG1kaWZjbnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNDMxOTAsImV4cCI6MjA4MjkxOTE5MH0.tk9hggkNUhEU1YBiJILm3cn9so2yA1H6QJ8rZ6x_6eI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);