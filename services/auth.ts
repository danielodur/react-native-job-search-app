import { supabase } from '../lib/supabase';

export interface AuthError {
  message: string;
}

export interface AuthResponse {
  data: any | null;
  error: AuthError | null;
  success: boolean;
}

export const authService = {
  // Phone number sign up
  async signUpWithPhone(phone: string): Promise<AuthResponse> {
    try {
      // Ensure phone number is properly formatted with + prefix
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone
      });
      
      if (error) throw error;
      return { data, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: { message: error.message }, success: false };
    }
  },

  // Verify phone number
  async verifyOTP(phone: string, token: string): Promise<AuthResponse> {
    try {
      // Always use 123456 for testing
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: '123456', // For testing, always use 123456
        type: 'sms'
      });
      
      if (error) throw error;
      return { data, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: { message: error.message }, success: false };
    }
  },

  // Social sign in
  async signInWithProvider(provider: 'google' | 'facebook'): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'ourcareers4u://callback',
        },
      });

      if (error) throw error;
      return { data, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: { message: error.message }, success: false };
    }
  },

  // Sign out
  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { data: true, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: { message: error.message }, success: false };
    }
  },

  // Get current session
  async getSession(): Promise<AuthResponse> {
    try {
      const session = await supabase.auth.getSession();
      return { data: session, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: { message: error.message }, success: false };
    }
  },

  // Get current user
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return { data: session?.user ?? null, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: { message: error.message }, success: false };
    }
  },
}; 