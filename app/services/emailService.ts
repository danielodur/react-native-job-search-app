import emailjs from 'emailjs-com';

// Initialize EmailJS with your public key
emailjs.init('JFozQi9tEuYMcCNNB');

// Function to send an email
const sendEmail = (templateId: string, templateParams: Record<string, unknown>) => {
  return emailjs.send('service_jobs4u8m', templateId, templateParams)
    .then(response => {
      console.log('Email sent successfully:', response.status, response.text);
      return response;
    })
    .catch(error => {
      console.error('Error sending email:', error);
      throw error;
    });
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

// Function to send a verification email with a link
export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `https://yourapp.com/verify?token=${token}`;
  const params = {
    to_email: email,
    verification_link: verificationLink,
  };

  try {
    const response = await sendEmail('template_verification_link', params);
  } catch (error) {
    console.error('Email sending error:', error);
    throw error; // Re-throw the error to be caught in the calling function
  }
};

// Function to send a verification email with a code
export const sendVerificationCodeEmail = (email: string, code: string) => {
  const params = {
    to_email: email,
    verification_code: code,
  };

  return sendEmail('template_verification_code', params);
};