// emailService.ts
const EMAILJS_PUBLIC_KEY = 'JFozQi9tEuYMcCNNB';
const EMAILJS_SERVICE_ID = 'service_jobs4u8m';

// Function to send an email
const sendEmail = async (templateId: string, templateParams: Record<string, unknown>) => {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: templateParams,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send email');
  }

  return response;
};

// Specific functions for each template
export const sendWelcomeEmail = (params: Record<string, unknown>) => {
  return sendEmail('template_1dd5prn', params);
};

export const sendPasswordResetEmail = (params: Record<string, unknown>) => {
  return sendEmail('template_plc15s5t', params);
};

export const sendFeedbackRequestEmail = (params: Record<string, unknown>) => {
  return sendEmail('template_lfk08ad', params);
};

export const sendContactUsEmail = (params: Record<string, unknown>) => {
  return sendEmail('template_ndl7l22', params);
};

export const sendAutoReplyEmail = (params: Record<string, unknown>) => {
  return sendEmail('template_iv86918', params);
};

export const sendOneTimePasswordEmail = (params: Record<string, unknown>) => {
  return sendEmail('template_f091i1x', params);
};

// Function to call Supabase Edge Function for email verification
export const sendVerificationEmail = async (userEmail: string, userName: string) => {
  const response = await fetch('https://knaydakxphgmqvcccyia.supabase.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYXlkYWt4cGhnbXF2Y2NjeWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDcwMDEsImV4cCI6MjA1OTA4MzAwMX0.NHkuypU8vwDHwYAFk1Xkzbj200GZ_gazECQALIBVdeI`
    },
    body: JSON.stringify({
      templateId: 'your_template_id',
      templateParams: {
        to_name: userName,
        email: userEmail
      }
    })
  });

  if (!response.ok) {
    console.error('Failed to send verification email:', await response.text());
    throw new Error('Failed to send verification email');
  }

  console.log('Verification email sent successfully');
  return response;
};