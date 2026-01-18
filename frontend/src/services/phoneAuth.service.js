// Firebase Phone Authentication Service
// Uses Firebase's built-in phone verification with reCAPTCHA

import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../config/firebase';

// Store confirmation result globally for OTP verification
let confirmationResult = null;
let recaptchaVerifier = null;

/**
 * Initialize reCAPTCHA verifier
 * Must be called before sending OTP
 * @param {string} containerId - DOM element ID for reCAPTCHA (use 'recaptcha-container')
 * @param {boolean} invisible - If true, uses invisible reCAPTCHA
 */
export const initRecaptcha = (containerId = 'recaptcha-container', invisible = true) => {
    try {
        // Clear existing verifier if any
        if (recaptchaVerifier) {
            recaptchaVerifier.clear();
            recaptchaVerifier = null;
        }

        // Create new verifier
        recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
            size: invisible ? 'invisible' : 'normal',
            callback: () => {
                console.log('✅ reCAPTCHA verified');
            },
            'expired-callback': () => {
                console.log('⚠️ reCAPTCHA expired, please try again');
            }
        });

        return recaptchaVerifier;
    } catch (error) {
        console.error('❌ Error initializing reCAPTCHA:', error);
        throw error;
    }
};

/**
 * Send OTP to phone number using Firebase Phone Auth
 * @param {string} phoneNumber - Phone number with country code (e.g., +919876543210)
 * @returns {Promise<boolean>} - True if OTP sent successfully
 */
export const sendPhoneOTP = async (phoneNumber) => {
    try {
        // Ensure phone number has country code
        const formattedPhone = phoneNumber.startsWith('+')
            ? phoneNumber
            : `+91${phoneNumber}`; // Default to India

        console.log('📱 Sending OTP to:', formattedPhone);

        if (!recaptchaVerifier) {
            throw new Error('reCAPTCHA not initialized. Call initRecaptcha() first.');
        }

        // Send OTP
        confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);

        console.log('✅ OTP sent successfully!');
        return { success: true, message: 'OTP sent to your phone' };
    } catch (error) {
        console.error('❌ Error sending OTP:', error);

        // Reset reCAPTCHA on error
        if (recaptchaVerifier) {
            try {
                recaptchaVerifier.clear();
                recaptchaVerifier = null;
            } catch (e) {
                // Ignore clear errors
            }
        }

        // Handle specific errors
        if (error.code === 'auth/invalid-phone-number') {
            throw new Error('Invalid phone number format');
        } else if (error.code === 'auth/too-many-requests') {
            throw new Error('Too many attempts. Please try again later.');
        } else if (error.code === 'auth/captcha-check-failed') {
            throw new Error('reCAPTCHA verification failed. Please refresh and try again.');
        }

        throw new Error(error.message || 'Failed to send OTP');
    }
};

/**
 * Verify the OTP code
 * @param {string} code - 6-digit OTP code
 * @returns {Promise<object>} - User credential on success
 */
export const verifyPhoneOTP = async (code) => {
    try {
        if (!confirmationResult) {
            throw new Error('No OTP was sent. Please request OTP first.');
        }

        console.log('🔐 Verifying OTP...');

        const result = await confirmationResult.confirm(code);

        console.log('✅ Phone verified successfully!');

        // Clear the confirmation result after successful verification
        confirmationResult = null;

        return {
            success: true,
            user: result.user,
            message: 'Phone verified successfully'
        };
    } catch (error) {
        console.error('❌ OTP verification failed:', error);

        if (error.code === 'auth/invalid-verification-code') {
            throw new Error('Invalid OTP code. Please try again.');
        } else if (error.code === 'auth/code-expired') {
            throw new Error('OTP has expired. Please request a new one.');
        }

        throw new Error(error.message || 'Failed to verify OTP');
    }
};

/**
 * Clean up reCAPTCHA
 * Call this when component unmounts
 */
export const cleanupRecaptcha = () => {
    if (recaptchaVerifier) {
        try {
            recaptchaVerifier.clear();
        } catch (e) {
            // Ignore errors during cleanup
        }
        recaptchaVerifier = null;
    }
    confirmationResult = null;
};

/**
 * Check if an OTP has been sent and is pending verification
 */
export const isOTPPending = () => {
    return confirmationResult !== null;
};

export default {
    initRecaptcha,
    sendPhoneOTP,
    verifyPhoneOTP,
    cleanupRecaptcha,
    isOTPPending
};
