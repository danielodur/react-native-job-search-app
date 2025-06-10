// Import necessary modules
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/environment';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Email sending function
const sendVerificationCodeEmail = async (email: string, code: string) => {
  try {
    // Using Supabase for email verification
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `yourapp://verify-email?code=${code}`,
    });
    
    if (error) {
      console.error('Failed to send verification email:', error.message);
      throw new Error('Failed to send verification email');
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Export the supabase client and email function
export {
  supabase,
  sendVerificationCodeEmail
};