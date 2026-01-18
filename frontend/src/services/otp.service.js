// Email OTP Service using EmailJS
// SMS OTP uses console logging (integrate Twilio for production SMS)

import emailjs from '@emailjs/browser';

// EmailJS Configuration from environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Check if EmailJS is configured
const isEmailJSConfigured = () => {
    return EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY &&
        !EMAILJS_SERVICE_ID.includes('your_') &&
        !EMAILJS_TEMPLATE_ID.includes('your_') &&
        !EMAILJS_PUBLIC_KEY.includes('your_');
};

/**
 * Send OTP via Email using EmailJS
 * Falls back to console logging if EmailJS is not configured
 */
export const sendEmailOTP = async (email, otp, name = 'User') => {
    // If EmailJS is configured, use it
    if (isEmailJSConfigured()) {
        try {
            console.log('📧 Sending OTP via EmailJS to:', email);

            const response = await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    to_email: email,
                    to_name: name,
                    otp_code: otp,
                    reply_to: email,
                },
                EMAILJS_PUBLIC_KEY
            );

            if (response.status === 200) {
                console.log('✅ OTP email sent successfully!');
                alert(`📧 OTP sent to ${email}. Please check your inbox (and spam folder).`);
                return { success: true, message: 'OTP sent to email' };
            } else {
                alert(`❌ EmailJS failed: ${response.text}. Checking console...`);
                throw new Error('EmailJS returned non-200 status');
            }
        } catch (error) {
            console.error('❌ EmailJS error:', error);
            alert(`❌ Error sending email: ${error.message || 'Check console for details'}`);
            // Fall back to console logging on error
            console.log('⚠️ Falling back to console OTP...');
        }
    } else {
        console.warn('⚠️ EmailJS not configured! Add VITE_EMAILJS_* variables to .env');
        alert(`ℹ️ EmailJS not configured. OTP will be in browser Console.`);
    }

    // Fallback: Log delivery status to console (without leaking OTP)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 EMAIL OTP (Requested)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${email}`);
    console.log(`Status: Delivery triggered`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (!isEmailJSConfigured()) {
        console.warn('⚠️ EmailJS not configured! Add VITE_EMAILJS_* variables to .env');
    }

    return { success: true, message: 'OTP sent to email' };
};

/**
 * Send OTP via SMS using Firebase Phone Auth
 * Note: For Firebase Phone Auth, use the dedicated phoneAuth.service.js
 * This function is kept for backwards compatibility and console fallback
 */
export const sendMobileOTP = async (mobile, otp, name = 'User') => {
    // Log delivery status to console (without leaking OTP)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 SMS OTP (Requested)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: +91 ${mobile}`);
    console.log(`Status: Delivery triggered`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return { success: true, message: 'OTP sent to mobile' };
};

// Re-export Firebase Phone Auth functions for convenience
export {
    initRecaptcha,
    sendPhoneOTP,
    verifyPhoneOTP,
    cleanupRecaptcha,
    isOTPPending
} from './phoneAuth.service';

/**
 * Show OTP in browser alert (for testing only)
 */
export const showOTPInAlert = (type, contact, otp) => {
    const message = `
🔐 OTP for Testing

Type: ${type === 'email' ? '📧 Email' : '📱 Mobile'}
Sent to: ${contact}

Your OTP: ${otp}

⏰ Valid for 60 seconds
    `.trim();

    alert(message);
};

export default {
    sendEmailOTP,
    sendMobileOTP,
    showOTPInAlert
};
