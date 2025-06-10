// Supabase Configuration
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Warning: Supabase environment variables are not properly set');
  console.warn('SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Missing');
  console.warn('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Set' : 'Missing');
}

// Helper function to validate Supabase configuration
export const validateSupabaseConfig = () => {
  const issues = [];
  
  if (!SUPABASE_URL) {
    issues.push('EXPO_PUBLIC_SUPABASE_URL is not configured');
  }
  
  if (!SUPABASE_ANON_KEY) {
    issues.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is not configured');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// Export configuration object
export const config = {
  supabase: {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
  }
}; 