/**
 * Simplified OTP generation for testing
 * No Firestore needed - just generates and returns OTP
 */

// In-memory storage for OTPs (for testing only)
const otpStore = new Map();

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPSimple = async (contact, type) => {
    try {
        // Generate 6-digit OTP
        const otp = generateOTP();

        // Store in memory with expiry
        const sessionId = `session_${Date.now()}_${Math.random()}`;
        otpStore.set(sessionId, {
            otp,
            contact,
            type,
            expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
            verified: false
        });

        // Log to console
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`${type === 'email' ? '📧 EMAIL' : '📱 MOBILE'} OTP`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`To: ${contact}`);
        console.log(`OTP: ${otp}`);
        console.log(`Session: ${sessionId}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return {
            success: true,
            sessionId,
            otp, // Return OTP for display
            expiresIn: 600
        };
    } catch (error) {
        console.error('OTP Generation Error:', error);
        throw new Error('Failed to generate OTP');
    }
};

export const verifyOTPSimple = async (sessionId, otp) => {
    try {
        const session = otpStore.get(sessionId);

        if (!session) {
            throw new Error('Invalid session');
        }

        if (session.expiresAt < Date.now()) {
            throw new Error('OTP expired');
        }

        if (session.verified) {
            throw new Error('OTP already used');
        }

        if (session.otp === otp) {
            session.verified = true;
            otpStore.set(sessionId, session);
            return { success: true, verified: true };
        } else {
            throw new Error('Invalid OTP');
        }
    } catch (error) {
        console.error('OTP Verification Error:', error);
        throw error;
    }
};

export default {
    sendOTPSimple,
    verifyOTPSimple,
    generateOTP
};
