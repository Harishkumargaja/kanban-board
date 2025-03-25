import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzgwtmcrdcexfnwttyzm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6Z3d0bWNyZGNleGZud3R0eXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODg4NTIsImV4cCI6MjA1ODM2NDg1Mn0.IjygfSTACEZw2t4GqyXtQbZI5lc1SNsof-zuRDvHQl4';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);