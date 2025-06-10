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
export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `https://yourapp.com/verify?token=${token}`;
  const params = {
    to_email: email,
    verification_link: verificationLink,
  };

  try {
    await sendEmail('template_verification_link', params);
  } catch (error) {
    console.error('Email sending error:', error);
    throw error; // Re-throw the error to be caught in the calling function
  }
};