import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Get these from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://knaydakxphgmqvcccyia.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYXlkYWt4cGhnbXF2Y2NjeWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDcwMDEsImV4cCI6MjA1OTA4MzAwMX0.NHkuypU8vwDHwYAFk1Xkzbj200GZ_gazECQALIBVdeI';

// Use deep linking URL for React Native
const redirectUrl = 'ourcareers4u://auth/callback';

// Configure email settings with Cloudflare API Token
const emailSettings = {
  auth: {
    smtp: {
      host: 'smtp.cloudflare.email',
      port: 465,
      secure: true,
      requireTLS: true,
      tls: {
        rejectUnauthorized: true
      },
      auth: {
        user: 'authentication@ourcareers4u.com',
        pass: 'Z3iI9u2UBjcgtJBsWwo_EzZa8a3O8WqxLU0oCNUC'
      },
      from: 'authentication@ourcareers4u.com'
    }
  }
};

console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.SUPABASE_ANON_KEY);

// Create Supabase client with email settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true, // Changed to true
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
});