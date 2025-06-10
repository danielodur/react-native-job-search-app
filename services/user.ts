import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  email?: string;
  is_phone_verified?: boolean;
  is_email_verified?: boolean;
  updated_at?: string;
  created_at?: string;
}

export const userService = {
  async getProfile(): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      return { profile: data, error: null };
    } catch (error: any) {
      return {
        profile: null,
        error: error.message,
      };
    }
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async updatePhoneNumber(phoneNumber: string): Promise<{ success: boolean; error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const { error } = await supabase
        .from('profiles')
        .update({
          phone_number: phoneNumber,
          is_phone_verified: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async updateAvatar(avatarUrl: string): Promise<{ success: boolean; error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
}; 