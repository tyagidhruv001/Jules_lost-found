import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyUserContact, sendOTP, verifyOTP, loginWithSystemPassword } from '../../services/user.service';
import OTPInput from '../../components/auth/OTPInput';
import { AlertCircle, ArrowLeft, GraduationCap, Building2 } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('student'); // 'student' or 'faculty'

    // Form States
    const [identifier, setIdentifier] = useState('');
    const [mobile, setMobile] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [otpSession, setOtpSession] = useState(null);

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIdentifier('');
        setMobile('');
        setError('');
        setShowOTP(false);
        setOtpSession(null);
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const cleanIdentifier = identifier.trim();
            const cleanMobile = mobile.trim();

            const verification = await verifyUserContact(cleanIdentifier, cleanMobile, activeTab);

            if (!verification.exists) {
                throw new Error(verification.error || 'User not found. Please check your credentials.');
            }

            // 2. Send Synchronized OTP (Same code to BOTH channels)
            const emailToUse = verification.personalEmail || verification.email;
            const otpResult = await sendOTP(
                verification.userId,
                ['email', 'mobile'], // Unified delivery
                { email: emailToUse, mobile: cleanMobile },
                verification.name
            );

            setOtpSession(otpResult.sessionId);

            // 3. Show OTP Input
            setShowOTP(true);
        } catch (err) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            setIsLoading(true);
            setError('');
            const cleanIdentifier = identifier.trim();
            const cleanMobile = mobile.trim();
            const verification = await verifyUserContact(cleanIdentifier, cleanMobile, activeTab);

            if (!verification.exists) throw new Error('User not found');

            const emailToUse = verification.personalEmail || verification.email;
            const otpResult = await sendOTP(
                verification.userId,
                ['email', 'mobile'],
                { email: emailToUse, mobile: cleanMobile },
                verification.name
            );
            setOtpSession(otpResult.sessionId);
            alert('A new OTP has been sent to your email and mobile.');
        } catch (err) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyLogin = async (otp) => {
        setError('');
        setIsLoading(true);

        try {
            // 4. Verify OTP using Firestore-based system
            await verifyOTP(otpSession, otp);

            // 5. Login with system password
            const verification = await verifyUserContact(identifier.trim(), mobile.trim(), activeTab);

            if (!verification.exists) {
                throw new Error('Session expired, please restart login');
            }

            await loginWithSystemPassword(verification.email, identifier.trim());

            // Navigate to dashboard
            navigate(`/${activeTab}/dashboard`);

        } catch (err) {
            console.error('OTP Verification/Login Error:', err);
            setError(err.message || 'Login failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-radial from-gray-800 via-gray-900 to-[#0b0f1a] text-white overflow-x-hidden">
            {/* Animated Background Blurs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-0 w-80 h-80 bg-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
            </div>


            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-8 left-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                    <span>Back to Home</span>
                </button>

                {/* Login Card */}
                <div className="w-full max-w-md">
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                                Welcome Back
                            </h1>
                            <p className="text-white/60 text-sm">
                                Secure Login via OTP
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                <AlertCircle className="flex-shrink-0 text-red-400 mt-0.5" size={20} />
                                <p className="text-red-200 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl mb-8">
                            <button
                                onClick={() => handleTabChange('student')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-medium ${activeTab === 'student'
                                    ? 'bg-cyan-500/20 text-cyan-300 shadow-lg'
                                    : 'text-white/60 hover:bg-white/5'
                                    }`}
                            >
                                <GraduationCap size={20} />
                                Student
                            </button>
                            <button
                                onClick={() => handleTabChange('faculty')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-medium ${activeTab === 'faculty'
                                    ? 'bg-purple-500/20 text-purple-300 shadow-lg'
                                    : 'text-white/60 hover:bg-white/5'
                                    }`}
                            >
                                <Building2 size={20} />
                                Faculty
                            </button>
                        </div>

                        {/* Login Form */}
                        {!showOTP ? (
                            <form onSubmit={handleSendOTP} className="space-y-5 animate-fadeIn">
                                {/* Identifier Input */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-white/80">
                                        {activeTab === 'student' ? 'University Roll Number' : 'Faculty ID'}
                                    </label>
                                    <input
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder={activeTab === 'student' ? 'e.g., 2115000123' : 'e.g., FAC2024001'}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20 transition-all"
                                    />
                                </div>

                                {/* Mobile Input */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-white/80">
                                        Registered Mobile Number
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-medium">+91</span>
                                        <input
                                            type="tel"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            placeholder="XXXXXXXXXX"
                                            maxLength={10}
                                            required
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3 rounded-xl text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'student'
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-cyan-500/20'
                                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-purple-500/20'
                                        }`}
                                >
                                    {isLoading ? 'Verifying...' : 'Get OTP'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="text-center">
                                    <p className="text-white/80">Enter OTP sent to</p>
                                    <p className="text-cyan-300 font-semibold text-lg tracking-wider">+91 {mobile}</p>
                                    <button
                                        onClick={() => setShowOTP(false)}
                                        className="text-xs text-white/40 underline hover:text-white mt-2"
                                    >
                                        Change Details
                                    </button>
                                </div>

                                <OTPInput
                                    length={6}
                                    onComplete={handleVerifyLogin}
                                    onResend={handleResendOTP}
                                    isLoading={isLoading}
                                />
                            </div>
                        )}

                        {/* Sign Up Link */}
                        <div className="mt-8 text-center pt-6 border-t border-white/10">
                            <p className="text-white/60 text-sm">
                                First time user?{' '}
                                <button
                                    onClick={() => navigate('/register')}
                                    className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors"
                                >
                                    Register Here
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
