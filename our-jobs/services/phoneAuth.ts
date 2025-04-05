import { supabase } from '../lib/supabase';

const phoneAuth = {
  async signUpWithPhone(phone: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });
      
      if (error) throw error;
      return { data, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: { message: error.message }, success: false };
    }
  },

  async verifyOTP(phone: string, token: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: token,
        type: 'sms'
      });

      if (error) throw error;
      return { data, error: null, success: true };
    } catch (error: any) {
      return { data: null, error: { message: error.message }, success: false };
    }
  }
};

export default phoneAuth; 